
import { inferType } from "./infer-type";

import {validateSchemaConstraints} from "../validation/schema-validator";

import type {InferenceOptions,InferenceResult} from "./schema";

import type {SchemaConstraints,SchemaValidationResult} from "../validation/type-constraints";

export interface InferSchemaResult extends InferenceResult {
  validation: SchemaValidationResult;
}

export function inferSchema(
  input: unknown,
  inferenceOptions: InferenceOptions = {},
  constraints: Partial<SchemaConstraints> = {},
): InferSchemaResult {

  const inference = inferType(input, inferenceOptions);

  const validation = validateSchemaConstraints(
    inference.schema,
    constraints,
  );

  return {
    ...inference,
    validation,
  };
}
