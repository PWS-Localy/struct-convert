import type {ArraySchema,FieldSchema,ObjectSchema,TypeSchema,UnionSchema} from "./schema";

export interface NormalizeSchemaOptions {
  maxDepth?: number;
}

export type SchemaNormalizationErrorCode =
  | "INVALID_SCHEMA"
  | "UNKNOWN_KIND"
  | "INVALID_METADATA"
  | "EMPTY_UNION"
  | "CYCLIC_SCHEMA"
  | "MAX_DEPTH_EXCEEDED";

export class SchemaNormalizationError extends Error {
  readonly code: SchemaNormalizationErrorCode;
  readonly path: string;

  constructor(
    code: SchemaNormalizationErrorCode,
    path: string,
    message: string,
  ) {
    super(`${message} at ${path}`);
    this.name = "SchemaNormalizationError";
    this.code = code;
    this.path = path;
  }
}

const KIND_ORDER: Record<TypeSchema["kind"], number> = {
  null: 0,
  boolean: 1,
  number: 2,
  string: 3,
  array: 4,
  object: 5,
  any: 6,
  union: 7,
};

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isSafeNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isSafePositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function fail(code: SchemaNormalizationErrorCode,path: string,message: string,): never {
  throw new SchemaNormalizationError(code, path, message);
}

export function validateSchema(schema: unknown,options: NormalizeSchemaOptions = {},): asserts schema is TypeSchema {
  const maxDepth = options.maxDepth ?? 128;

  if (!Number.isSafeInteger(maxDepth) || maxDepth < 1) {
    throw new TypeError("maxDepth must be a positive safe integer");
  }

  const active = new WeakSet<object>();

  const visit = (value: unknown, path: string, depth: number): void => {
    if (depth > maxDepth) {
      fail("MAX_DEPTH_EXCEEDED", path, `Maximum schema depth ${maxDepth} exceeded`);
    }

    if (!isRecord(value)) {
      fail("INVALID_SCHEMA", path, "Expected a schema object");
    }

    if (active.has(value)) {
      fail("CYCLIC_SCHEMA", path, "Circular schema reference detected");
    }

    active.add(value);

    try {
      const kind = value.kind;

      switch (kind) {
        case "string":
        case "boolean":
        case "null":
        case "any": {
          if ("integer" in value) {
            fail("INVALID_SCHEMA", path, `Property integer is only valid for number schemas`);
          }
          return;
        }

        case "number": {
          if ("integer" in value && typeof value.integer !== "boolean") {
            fail("INVALID_SCHEMA", path, "number.integer must be a boolean when provided");
          }
          return;
        }

        case "object": {
          if (!isSafePositiveInteger(value.sampleCount)) {
            fail("INVALID_METADATA", path, "object.sampleCount must be a positive safe integer");
          }

          if (!isRecord(value.properties)) {
            fail("INVALID_SCHEMA", path, "object.properties must be a plain object");
          }

          for (const key of Object.keys(value.properties)) {
            const fieldPath = `${path}.${key}`;
            const field = value.properties[key];

            if (!isRecord(field)) {
              fail("INVALID_SCHEMA", fieldPath, "Field schema must be an object");
            }

            if (typeof field.optional !== "boolean") {
              fail("INVALID_SCHEMA", fieldPath, "field.optional must be a boolean");
            }

            if (typeof field.nullable !== "boolean") {
              fail("INVALID_SCHEMA", fieldPath, "field.nullable must be a boolean");
            }

            if (!isSafePositiveInteger(field.presentCount)) {
              fail("INVALID_METADATA", fieldPath, "field.presentCount must be a positive safe integer");
            }

            if (!isSafePositiveInteger(field.totalCount)) {
              fail("INVALID_METADATA", fieldPath, "field.totalCount must be a positive safe integer");
            }

            if (field.totalCount !== value.sampleCount) {
              fail(
                "INVALID_METADATA",
                fieldPath,
                `field.totalCount (${String(field.totalCount)}) must equal object.sampleCount (${String(value.sampleCount)})`,
              );
            }

            if (field.presentCount > field.totalCount) {
              fail("INVALID_METADATA", fieldPath, "field.presentCount cannot exceed totalCount");
            }

            if (field.optional !== (field.presentCount < field.totalCount)) {
              fail(
                "INVALID_METADATA",
                fieldPath,
                "field.optional must match presentCount < totalCount",
              );
            }

            visit(field.type, fieldPath, depth + 1);
          }
          return;
        }

        case "array": {
          if (!isSafePositiveInteger(value.sampleCount)) {
            fail("INVALID_METADATA", path, "array.sampleCount must be a positive safe integer");
          }

          if (!isSafeNonNegativeInteger(value.minLength) || !isSafeNonNegativeInteger(value.maxLength)) {
            fail("INVALID_METADATA", path, "array lengths must be non-negative safe integers");
          }

          if (value.minLength > value.maxLength) {
            fail("INVALID_METADATA", path, "array.minLength cannot exceed maxLength");
          }

          if (typeof value.empty !== "boolean") {
            fail("INVALID_SCHEMA", path, "array.empty must be a boolean");
          }

          if (value.empty !== (value.maxLength === 0)) {
            fail(
              "INVALID_METADATA",
              path,
              "array.empty must be true exactly when every observed array is empty (maxLength === 0)",
            );
          }

          visit(value.items, `${path}[]`, depth + 1);

          if (value.empty && (!isRecord(value.items) || value.items.kind !== "any")) {
            fail("INVALID_SCHEMA", path, "An entirely empty inferred array must use items: any");
          }
          return;
        }

        case "union": {
          if (!Array.isArray(value.variants) || value.variants.length === 0) {
            fail("EMPTY_UNION", path, "union.variants must contain at least one schema");
          }

          value.variants.forEach((variant, index) => {
            visit(variant, `${path}.variants[${index}]`, depth + 1);
          });
          return;
        }

        default:
          fail("UNKNOWN_KIND", path, `Unknown schema kind: ${String(kind)}`);
      }
    } finally {
      active.delete(value);
    }
  };

  visit(schema, "$", 0);
}

export function normalizeSchema(schema: TypeSchema,options: NormalizeSchemaOptions = {},): TypeSchema {
  validateSchema(schema, options);
  const maxDepth = options.maxDepth ?? 128;
  return normalizeNode(schema, "$", 0, maxDepth);
}

function normalizeNode(schema: TypeSchema,path: string,depth: number,maxDepth: number,): TypeSchema {
  if (depth > maxDepth) {
    fail("MAX_DEPTH_EXCEEDED", path, `Maximum schema depth ${maxDepth} exceeded`);
  }

  switch (schema.kind) {
    case "string":
    case "boolean":
    case "null":
    case "any":
      return { kind: schema.kind };

    case "number":
      return {
        kind: "number",
        // Missing integer metadata is treated conservatively as non-integer.
        integer: schema.integer === true,
      };

    case "object": {
      const entries = Object.keys(schema.properties).sort(compareText).map((key) => {
        const field = schema.properties[key];
        const normalizedFieldType = normalizeNode(
            field.type,
            `${path}.${key}`,
            depth + 1,
            maxDepth,
        );
        
        const extracted = extractNullability(normalizedFieldType);

        const normalizedField: FieldSchema = {
          type: extracted.type,
          optional: field.optional,
          nullable: field.nullable || extracted.hasNull,
          presentCount: field.presentCount,
          totalCount: field.totalCount,
        };

        return [key, normalizedField] as const;

        });

      return {
        kind: "object",
        sampleCount: schema.sampleCount,
        properties: Object.fromEntries(entries),
      };
    }

    case "array":
      return {
        kind: "array",
        items: normalizeNode(schema.items, `${path}[]`, depth + 1, maxDepth),
        minLength: schema.minLength,
        maxLength: schema.maxLength,
        sampleCount: schema.sampleCount,
        empty: schema.empty,
      };

    case "union":
      return normalizeUnion(
        schema.variants.map((variant, index) =>
          normalizeNode(variant, `${path}.variants[${index}]`, depth + 1, maxDepth),
        ),
        path,
      );
  }
}

function extractNullability(type: TypeSchema): { type: TypeSchema; hasNull: boolean } {
  if (type.kind === "null") {
    return { type, hasNull: true };
  }

  if (type.kind !== "union") {
    return { type, hasNull: false };
  }

  const remaining = type.variants.filter((variant) => variant.kind !== "null");
  const hasNull = remaining.length !== type.variants.length;

  if (!hasNull) {
    return { type, hasNull: false };
  }

  if (remaining.length === 0) {
    return { type: { kind: "null" }, hasNull: true };
  }

  if (remaining.length === 1) {
    return { type: remaining[0], hasNull: true };
  }

  return {
    type: { kind: "union", variants: remaining },
    hasNull: true,
  };
}

function normalizeUnion(variants: TypeSchema[], path: string): TypeSchema {
  const flattened: TypeSchema[] = [];

  for (const variant of variants) {
    if (variant.kind === "union") {
      flattened.push(...variant.variants);
    } else {
      flattened.push(variant);
    }
  }

  if (flattened.some((variant) => variant.kind === "any")) {
    return { kind: "any" };
  }

  const byKind = new Map<TypeSchema["kind"], TypeSchema>();

  for (const variant of flattened) {
    const existing = byKind.get(variant.kind);

    if (!existing) {
      byKind.set(variant.kind, variant);
      continue;
    }

    byKind.set(
      variant.kind,
      mergeSameKind(existing, variant, path),
    );
  }

  const normalized = [...byKind.values()].sort(
    (a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
  );

  if (normalized.length === 0) {
    fail("EMPTY_UNION", path, "Cannot normalize an empty union");
  }

  if (normalized.length === 1) {
    return normalized[0];
  }

  return { kind: "union", variants: normalized };
}

function mergeSameKind(
  left: TypeSchema,
  right: TypeSchema,
  path: string,
): TypeSchema {
  if (left.kind !== right.kind) {
    return normalizeUnion([left, right], path);
  }

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
      return mergeObjects(left, right as ObjectSchema, path);

    case "array":
      return mergeArrays(left, right as ArraySchema, path);

    case "union":
      return normalizeUnion(
        [...left.variants, ...(right as UnionSchema).variants],
        path,
      );
  }
}

function mergeObjects(
  left: ObjectSchema,
  right: ObjectSchema,
  path: string,
): ObjectSchema {
  const sampleCount = safeAdd(left.sampleCount, right.sampleCount, path, "object.sampleCount");
  const keys = [...new Set([
    ...Object.keys(left.properties),
    ...Object.keys(right.properties),
  ])].sort(compareText);

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
      const mergedField = mergeFieldTypes(a.type, b.type, `${path}.${key}`);
      type = mergedField.type;
      nullable ||= mergedField.nullable;
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

  return { kind: "object", sampleCount, properties };
}

function mergeFieldTypes(
  left: TypeSchema,
  right: TypeSchema,
  path: string,
): { type: TypeSchema; nullable: boolean } {
  if (left.kind === "null" && right.kind !== "null") {
    return { type: right, nullable: true };
  }

  if (right.kind === "null" && left.kind !== "null") {
    return { type: left, nullable: true };
  }

  return {
    type: mergeSameKindOrUnion(left, right, path),
    nullable: false,
  };
}

function mergeSameKindOrUnion(
  left: TypeSchema,
  right: TypeSchema,
  path: string,
): TypeSchema {
  if (left.kind === right.kind) {
    return mergeSameKind(left, right, path);
  }

  return normalizeUnion([left, right], path);
}

function mergeArrays(
  left: ArraySchema,
  right: ArraySchema,
  path: string,
): ArraySchema {
  let items: TypeSchema;

  if (left.empty && !right.empty) {
    items = right.items;
  } else if (!left.empty && right.empty) {
    items = left.items;
  } else {
    items = mergeSameKindOrUnion(left.items, right.items, `${path}[]`);
  }

  return {
    kind: "array",
    items,
    minLength: Math.min(left.minLength, right.minLength),
    maxLength: Math.max(left.maxLength, right.maxLength),
    sampleCount: safeAdd(left.sampleCount, right.sampleCount, path, "array.sampleCount"),
    empty: left.empty && right.empty,
  };
}

function safeAdd(a: number, b: number, path: string, label: string): number {
  const result = a + b;
  if (!Number.isSafeInteger(result)) {
    fail("INVALID_METADATA", path, `${label} exceeds the safe integer range`);
  }
  return result;
}
