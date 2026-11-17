import type {ArraySchema,InferenceWarning} from "./schema";
import { inferValue } from "./infer-value";
import type { MergeContext } from "./merge-types";
import { mergeTypes } from "./merge-types";

export function inferArray(
  values: unknown[],
  context: MergeContext,
  warnings: InferenceWarning[],
  path = "$",
): ArraySchema {
  if (values.length === 0) {
    warnings.push({
      code: "EMPTY_ARRAY",
      path,
      message: "Cannot infer item type from an empty array.",
    });

    return {
      kind: "array",
      items: { kind: "any" },
      minLength: 0,
      maxLength: 0,
      sampleCount: 1,
      empty: true,
    };
  }

  let items = inferValue(values[0], context, warnings, `${path}[0]`);

  for (let index = 1; index < values.length; index++) {
    const next = inferValue(values[index], context, warnings, `${path}[${index}]`);
    items = mergeTypes(items, next, context, `${path}[]`);
  }

  return {
    kind: "array",
    items,
    minLength: values.length,
    maxLength: values.length,
    sampleCount: 1,
    empty: false,
  };
}
