import type {InferenceWarning,ObjectSchema,TypeSchema} from "./schema";
import { inferValue } from "./infer-value";
import type { MergeContext } from "./merge-types";
import { mergeTypes } from "./merge-types";

export function inferObject(
  values: Record<string, unknown>[],
  context: MergeContext,
  warnings: InferenceWarning[],
  path = "$",
): ObjectSchema {
  if (values.length === 0) {
    throw new Error(`Cannot infer an object from zero samples at ${path}`);
  }

  const keys = new Set<string>();
  for (const value of values) {
    for (const key of Object.keys(value)) {
      keys.add(key);
    }
  }

  const properties = Object.fromEntries(
    [...keys].sort().map((key) => {
      const fieldValues = values
        .filter((value) => Object.prototype.hasOwnProperty.call(value, key))
        .map((value) => value[key]);

      const presentCount = fieldValues.length;
      const totalCount = values.length;
      const nonNullValues = fieldValues.filter((value) => value !== null);
      const nullable = fieldValues.some((value) => value === null);

      let type: TypeSchema;
      if (nonNullValues.length === 0) {
        type = { kind: "null" as const };
      } else {
        type = inferValue(nonNullValues[0], context, warnings, `${path}.${key}`);

        for (let index = 1; index < nonNullValues.length; index++) {
          const next = inferValue(
            nonNullValues[index],
            context,
            warnings,
            `${path}.${key}`,
          );
          type = mergeTypes(type, next, context, `${path}.${key}`);
        }
      }

      return [key, {
        type,
        optional: presentCount < totalCount,
        nullable,
        presentCount,
        totalCount,
      }] as const;
    }),
  );

  return {
    kind: "object",
    sampleCount: values.length,
    properties,
  };
}
