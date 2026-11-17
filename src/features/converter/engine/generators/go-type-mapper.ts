
import type {TypeSchema,FieldSchema} from "../inference/schema";

export type GoUnionStrategy = "any" | "error";

export interface GoTypeMapperOptions {
  unionStrategy?: GoUnionStrategy;
}

export interface GoTypeMapperContext {
  path?: string;
  resolveObjectTypeName?: (path: string) => string;
}

const DEFAULT_OPTIONS: Required<GoTypeMapperOptions> = {
  unionStrategy: "any",
};

export function mapGoType(
  schema: TypeSchema,
  context: GoTypeMapperContext = {},
  options: GoTypeMapperOptions = {},
): string {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const path = context.path ?? "$";

  switch (schema.kind) {
    case "string":
      return "string";

    case "number":
      return schema.integer === true ? "int64" : "float64";

    case "boolean":
      return "bool";

    case "null":
    case "any":
      return "any";

    case "object":
      return context.resolveObjectTypeName?.(path) ?? "map[string]any";

    case "array": {
      const itemType = mapGoType(
        schema.items,
        {
          ...context,
          path: `${path}Item`,
        },
        config,
      );

      return `[]${itemType}`;
    }

    case "union":
      if (config.unionStrategy === "error") {
        throw new Error(`Union type is not supported at ${path}`);
      }

      return "any";

    default: {
      const exhaustiveCheck: never = schema;
      throw new Error(
        `Unsupported schema: ${JSON.stringify(exhaustiveCheck)}`,
      );
    }
  }
}

export function mapGoFieldType(field: FieldSchema,context: GoTypeMapperContext = {},options: GoTypeMapperOptions = {},): string {
  const baseType = mapGoType(field.type, context, options);

  if (field.optional || field.nullable) {
    return baseType.startsWith("*") ? baseType : `*${baseType}`;
  }

  return baseType;
}
