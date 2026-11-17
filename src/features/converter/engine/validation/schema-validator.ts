
import type { TypeSchema } from "../inference/schema";

import {validateSchema,SchemaNormalizationError} from "../inference/normalize-schema";

import {
  DEFAULT_SCHEMA_CONSTRAINTS,
  type SchemaConstraints,
  type SchemaValidationIssue,
  type SchemaValidationResult,
} from "./type-constraints";

export function validateSchemaConstraints(
  input: unknown,
  constraints: Partial<SchemaConstraints> = {},
): SchemaValidationResult {

  const options: SchemaConstraints = {
    ...DEFAULT_SCHEMA_CONSTRAINTS,
    ...constraints,
  };

  const issues: SchemaValidationIssue[] = [];

  if (
    !Number.isSafeInteger(options.maxDepth) ||
    options.maxDepth < 1 ||
    !Number.isSafeInteger(options.maxUnionVariants) ||
    options.maxUnionVariants < 1 ||
    !Number.isSafeInteger(options.maxObjectProperties) ||
    options.maxObjectProperties < 1
  ) {
    throw new TypeError("Invalid schema constraint configuration");
  }

  try {
    validateSchema(input, {
      maxDepth: options.maxDepth,
    });
  } catch (error) {
   if (error instanceof SchemaNormalizationError) {
      issues.push({
        code: error.code,
        severity: "error",
        path: error.path,
        message: error.message,
      });

      return {
        valid: false,
        issues,
      };
    }
  }

  const schema = input as TypeSchema;

  visit(schema, "$", 0, options, issues);

  return {
    valid: !issues.some(
      (issue) => issue.severity === "error",
    ),
    issues,
  };
}

function visit(
  schema: TypeSchema,
  path: string,
  depth: number,
  constraints: SchemaConstraints,
  issues: SchemaValidationIssue[],
): void {

  if (depth > constraints.maxDepth) {
    issues.push({
      code: "MAX_DEPTH_EXCEEDED",
      severity: "error",
      path,
      message: `Maximum depth ${constraints.maxDepth} exceeded`,
    });

    return;
  }

  switch (schema.kind) {
    case "any": {
      if (!constraints.allowAny) {
        issues.push({
          code: "ANY_NOT_ALLOWED",
          severity: "error",
          path,
          message: "Any type is not allowed",
        });
      }

      return;
    }

    case "object": {
      const keys = Object.keys(schema.properties);

      if (keys.length > constraints.maxObjectProperties) {
        issues.push({
          code: "MAX_PROPERTIES_EXCEEDED",
          severity: "error",
          path,
          message:
            `Object has ${keys.length} properties; ` +
            `maximum is ${constraints.maxObjectProperties}`,
        });
      }

      for (const key of keys) {
        const field = schema.properties[key];
        const fieldPath = `${path}.${key}`;

        if (field.optional && !constraints.allowOptional) {
          issues.push({
            code: "OPTIONAL_NOT_ALLOWED",
            severity: "error",
            path: fieldPath,
            message: "Optional fields are not allowed",
          });
        }

        if (field.nullable && !constraints.allowNullable) {
          issues.push({
            code: "NULLABLE_NOT_ALLOWED",
            severity: "error",
            path: fieldPath,
            message: "Nullable fields are not allowed",
          });
        }

        visit(
          field.type,
          fieldPath,
          depth + 1,
          constraints,
          issues,
        );
      }

      return;
    }

    case "array": {
      visit(
        schema.items,
        `${path}[]`,
        depth + 1,
        constraints,
        issues,
      );

      return;
    }

    case "union": {
      if (!constraints.allowUnion) {
        issues.push({
          code: "UNION_NOT_ALLOWED",
          severity: "error",
          path,
          message: "Union types are not allowed",
        });
      }

      if (schema.variants.length > constraints.maxUnionVariants) {
        issues.push({
          code: "UNION_VARIANT_LIMIT",
          severity: "error",
          path,
          message:
            `Union has ${schema.variants.length} variants; ` +
            `maximum is ${constraints.maxUnionVariants}`,
        });
      }

      schema.variants.forEach((variant, index) => {
        visit(
          variant,
          `${path}.variants[${index}]`,
          depth + 1,
          constraints,
          issues,
        );
      });

      return;
    }

    default:
      return;
  }
}
