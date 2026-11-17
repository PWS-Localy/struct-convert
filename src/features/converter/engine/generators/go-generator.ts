import { toGoTypeName, uniqueGoName } from "./go-naming";
import { formatGoTag } from "./go-tags";

export type GoSchema =
  | { type: "string" | "boolean" | "null" | "any" }
  | { type: "number"; integer?: boolean }
  | { type: "object"; properties: Record<string, GoFieldSchema> }
  | { type: "array"; items: GoSchema }
  | { type: "union"; variants: GoSchema[] };

export interface GoFieldSchema {
  type: GoSchema;
  optional?: boolean;
  nullable?: boolean;
}

export interface GoGeneratorOptions {
  packageName?: string;
  rootName?: string;
  jsonTags?: boolean;
  omitempty?: boolean;
  pointerStrategy?: "never" | "missing" | "nullable" | "both";
  variableName?: string;
}

interface RenderContext {
  declarations: string[];
  usedTypeNames: Set<string>;
  options: Required<Pick<GoGeneratorOptions, "jsonTags" | "omitempty" | "pointerStrategy">>;
}

function goBaseType(schema: GoSchema, suggestedName: string, ctx: RenderContext): string {
  switch (schema.type) {
    case "string": return "string";
    case "boolean": return "bool";
    case "number": return schema.integer ? "int64" : "float64";
    case "null":
    case "any":
    case "union":
      return "any";
    case "array":
      return `[]${goBaseType(schema.items, `${suggestedName}Item`, ctx)}`;
    case "object":
      return renderObject(schema, suggestedName, ctx);
    default: {
      const exhaustive: never = schema;
      return exhaustive;
    }
  }
}

function renderObject(
  schema: Extract<GoSchema, { type: "object" }>,
  suggestedName: string,
  ctx: RenderContext,
): string {
  const typeName = uniqueGoName(toGoTypeName(suggestedName), ctx.usedTypeNames);
  const lines: string[] = [];

  for (const [sourceName, field] of Object.entries(schema.properties ?? {})) {
    const fieldName = uniqueGoName(sourceName, new Set(
      lines.map((line) => line.trim().split(/\s+/)[0]).filter(Boolean),
    ));
    let fieldType = goBaseType(field.type, `${typeName}${fieldName}`, ctx);

    const usePointer =
      ctx.options.pointerStrategy === "both" && (field.optional || field.nullable) ||
      ctx.options.pointerStrategy === "missing" && field.optional ||
      ctx.options.pointerStrategy === "nullable" && field.nullable;

    if (usePointer && fieldType !== "any" && !fieldType.startsWith("*")) {
      fieldType = `*${fieldType}`;
    }

    const tag = ctx.options.jsonTags
      ? formatGoTag(sourceName, {
          jsonName: sourceName,
          optional: ctx.options.omitempty && field.optional,
        })
      : "";

    lines.push(`\t${fieldName} ${fieldType}${tag ? ` ${tag}` : ""}`);
  }

  ctx.declarations.push(
    `type ${typeName} struct {\n${lines.join("\n")}\n}`,
  );
  return typeName;
}

export function generateGo(
  schema: GoSchema,
  options: GoGeneratorOptions = {},
): string {
  const ctx: RenderContext = {
    declarations: [],
    usedTypeNames: new Set<string>(),
    options: {
      jsonTags: options.jsonTags ?? true,
      omitempty: options.omitempty ?? true,
      pointerStrategy: options.pointerStrategy ?? "both",
    },
  };

  const rootName = toGoTypeName(options.rootName ?? "Root");
  let rootDeclaration = "";

  if (schema.type === "object") {
    renderObject(schema, rootName, ctx);
  } else if (schema.type === "array") {
    const itemName = rootName;
    const itemType = goBaseType(schema.items, itemName, ctx);
    rootDeclaration = `var ${options.variableName ?? `${itemName[0].toLowerCase()}${itemName.slice(1)}s`} []${itemType}`;
  } else {
    rootDeclaration = `type ${rootName} ${goBaseType(schema, rootName, ctx)}`;
  }

  const body = [...ctx.declarations, rootDeclaration].filter(Boolean).join("\n\n");
  const packageName = options.packageName ?? "models";

  return `package ${packageName}\n\n${body}\n`;
}

