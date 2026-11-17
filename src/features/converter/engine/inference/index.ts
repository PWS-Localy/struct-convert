export { inferType } from "./infer-type";
export { normalizeSchema, validateSchema, SchemaNormalizationError } from "./normalize-schema";

export type {
  PrimitiveKind,
  PrimitiveSchema,
  ObjectSchema,
  ArraySchema,
  UnionSchema,
  FieldSchema,
  TypeSchema,
  ConflictStrategy,
  InferenceOptions,
  InferenceWarning,
  InferenceResult,
} from "./schema";

export type { NormalizeSchemaOptions, SchemaNormalizationErrorCode } from "./normalize-schema";
