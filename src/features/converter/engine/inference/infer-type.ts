import type {InferenceOptions,InferenceResult,TypeSchema} from "./schema";
import { inferArray } from "./infer-array";
import { inferObject } from "./infer-object";
import { inferValue } from "./infer-value";
import type { MergeContext } from "./merge-types";
import { normalizeSchema } from "./normalize-schema";

export function inferType(
  input: unknown,
  options: InferenceOptions = {},
): InferenceResult {
  const warnings: InferenceResult["warnings"] = [];
  const context: MergeContext = {
    warnings,
    strategy: options.conflictStrategy ?? "union",
  };

  let schema: TypeSchema;

  if (Array.isArray(input)) {
    schema = inferArray(input, context, warnings);
  } else if (
    input !== null &&
    typeof input === "object" &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null)
  ) {
    schema = inferObject(
      [input as Record<string, unknown>],
      context,
      warnings,
    );
  } else {
    schema = inferValue(input, context, warnings);
  }

  return {
    schema: normalizeSchema(schema),
    warnings,
  };
}
