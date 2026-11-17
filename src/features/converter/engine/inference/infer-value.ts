import type {InferenceWarning,TypeSchema} from "./schema";
import { inferArray } from "./infer-array";
import { inferObject } from "./infer-object";
import type { MergeContext } from "./merge-types";

export function inferValue(
  value: unknown,
  context: MergeContext,
  warnings: InferenceWarning[],
  path = "$",
): TypeSchema {
  if (value === null) return { kind: "null" };
  if (typeof value === "string") return { kind: "string" };
  if (typeof value === "boolean") return { kind: "boolean" };

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      warnings.push({
        code: "UNKNOWN_TYPE",
        path,
        message: "Non-finite numbers are not valid JSON values.",
      });
      return { kind: "any" };
    }

    return { kind: "number", integer: Number.isInteger(value) };
  }

  if (typeof value === "undefined") {
    warnings.push({
      code: "UNKNOWN_TYPE",
      path,
      message: "Undefined is not a valid JSON value.",
    });
    return { kind: "any" };
  }

  if (Array.isArray(value)) {
    return inferArray(value, context, warnings, path);
  }

  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      warnings.push({
        code: "UNKNOWN_TYPE",
        path,
        message: "Non-plain objects are not supported.",
      });
      return { kind: "any" };
    }

    return inferObject(
      [value as Record<string, unknown>],
      context,
      warnings,
      path,
    );
  }

  warnings.push({
    code: "UNKNOWN_TYPE",
    path,
    message: `Unsupported value type: ${typeof value}`,
  });

  return { kind: "any" };
}
