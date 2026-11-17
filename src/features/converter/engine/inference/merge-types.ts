import type {ArraySchema,FieldSchema,InferenceWarning,ObjectSchema,TypeSchema} from "./schema";
import { normalizeSchema } from "./normalize-schema";

export interface MergeContext {
  warnings: InferenceWarning[];
  strategy: "any" | "strict" | "union";
}

export function mergeTypes(
  left: TypeSchema,
  right: TypeSchema,
  context: MergeContext,
  path = "$",
): TypeSchema {
  if (left.kind === "any" || right.kind === "any") {
    return { kind: "any" };
  }

  if (left.kind === "union" || right.kind === "union") {
    return mergeUnionTypes(left, right, context, path);
  }

  if (left.kind === right.kind) {
    return mergeSameKind(left, right, context, path);
  }

  return resolveConflict(left, right, context, path);
}

function mergeSameKind(
  left: TypeSchema,
  right: TypeSchema,
  context: MergeContext,
  path: string,
): TypeSchema {
  switch (left.kind) {
    case "string":
    case "boolean":
    case "null":
    case "any":
      return { kind: left.kind };

    case "number": {
      const rightNumber = right as Extract<TypeSchema, { kind: "number" }>;
      return {
        kind: "number",
        integer: left.integer === true && rightNumber.integer === true,
      };
    }

    case "object":
      return mergeObjects(
        left,
        right as ObjectSchema,
        context,
        path,
      );

    case "array":
      return mergeArrays(
        left,
        right as ArraySchema,
        context,
        path,
      );

    case "union":
      return mergeUnionTypes(left, right, context, path);
  }
}

function mergeObjects(
  left: ObjectSchema,
  right: ObjectSchema,
  context: MergeContext,
  path: string,
): ObjectSchema {
  const sampleCount = safeAdd(
    left.sampleCount,
    right.sampleCount,
    path,
    "object.sampleCount",
  );

  const keys = [...new Set([
    ...Object.keys(left.properties),
    ...Object.keys(right.properties),
  ])].sort();

  const properties = Object.fromEntries(keys.map((key) => {
    const a = left.properties[key];
    const b = right.properties[key];
    const presentCount = safeAdd(
      a?.presentCount ?? 0,
      b?.presentCount ?? 0,
      `${path}.${key}`,
      "field.presentCount",
    );

    let type: TypeSchema;
    let nullable = (a?.nullable ?? false) || (b?.nullable ?? false);

    if (a && b) {
      if (a.type.kind === "null" && b.type.kind !== "null") {
        type = b.type;
        nullable = true;
      } else if (b.type.kind === "null" && a.type.kind !== "null") {
        type = a.type;
        nullable = true;
      } else {
        type = mergeTypes(a.type, b.type, context, `${path}.${key}`);
      }
    } else {
      type = (a ?? b)!.type;
    }

    const field: FieldSchema = {
      type,
      optional: presentCount < sampleCount,
      nullable,
      presentCount,
      totalCount: sampleCount,
    };

    return [key, field] as const;
  }));

  return {
    kind: "object",
    sampleCount,
    properties,
  };
}

function mergeArrays(
  left: ArraySchema,
  right: ArraySchema,
  context: MergeContext,
  path: string,
): ArraySchema {
  let items: TypeSchema;

  if (left.empty && !right.empty) {
    items = right.items;
  } else if (!left.empty && right.empty) {
    items = left.items;
  } else {
    items = mergeTypes(left.items, right.items, context, `${path}[]`);
  }

  return {
    kind: "array",
    items,
    minLength: Math.min(left.minLength, right.minLength),
    maxLength: Math.max(left.maxLength, right.maxLength),
    sampleCount: safeAdd(
      left.sampleCount,
      right.sampleCount,
      path,
      "array.sampleCount",
    ),
    empty: left.empty && right.empty,
  };
}

function mergeUnionTypes(
  left: TypeSchema,
  right: TypeSchema,
  context: MergeContext,
  path: string,
): TypeSchema {
  const merged: TypeSchema[] = flatten(left);

  for (const incoming of flatten(right)) {
    if (incoming.kind === "any") {
      return { kind: "any" };
    }

    const existingIndex = merged.findIndex(
      (variant) => variant.kind === incoming.kind,
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = mergeTypes(
        merged[existingIndex],
        incoming,
        context,
        path,
      );
      continue;
    }

    if (merged.length > 0) {
      context.warnings.push({
        code: "TYPE_CONFLICT",
        path,
        message: `Conflicting types: ${merged.map((item) => item.kind).join(", ")} and ${incoming.kind}`,
      });

      if (context.strategy === "strict") {
        throw new Error(`Type conflict at ${path}: ${incoming.kind}`);
      }

      if (context.strategy === "any") {
        return { kind: "any" };
      }
    }

    merged.push(incoming);
  }

  return normalizeSchema({
    kind: "union",
    variants: merged,
  });
}

function flatten(schema: TypeSchema): TypeSchema[] {
  if (schema.kind !== "union") {
    return [schema];
  }

  return schema.variants.flatMap(flatten);
}

function resolveConflict(
  left: TypeSchema,
  right: TypeSchema,
  context: MergeContext,
  path: string,
): TypeSchema {
  context.warnings.push({
    code: "TYPE_CONFLICT",
    path,
    message: `Conflicting types: ${left.kind} and ${right.kind}`,
  });

  switch (context.strategy) {
    case "strict":
      throw new Error(`Type conflict at ${path}: ${left.kind} vs ${right.kind}`);
    case "any":
      return { kind: "any" };
    case "union":
      return normalizeSchema({
        kind: "union",
        variants: [left, right],
      });
  }
}

function safeAdd(a: number, b: number, path: string, label: string): number {
  const result = a + b;
  if (!Number.isSafeInteger(result)) {
    throw new Error(`${label} exceeds the safe integer range at ${path}`);
  }
  return result;
}
