export interface SchemaConstraints {
  allowAny: boolean;
  allowUnion: boolean;
  allowNullable: boolean;
  allowOptional: boolean;

  maxDepth: number;
  maxUnionVariants: number;
  maxObjectProperties: number;
}

export const DEFAULT_SCHEMA_CONSTRAINTS: SchemaConstraints = {
  allowAny: true,
  allowUnion: true,
  allowNullable: true,
  allowOptional: true,

  maxDepth: 128,
  maxUnionVariants: 32,
  maxObjectProperties: 500,
};

export type ValidationSeverity =
  | "error"
  | "warning";


export type SchemaValidationCode =
  | "INVALID_SCHEMA"
  | "UNKNOWN_KIND"
  | "INVALID_METADATA"
  | "EMPTY_UNION"
  | "CYCLIC_SCHEMA"
  | "MAX_DEPTH_EXCEEDED"
  | "ANY_NOT_ALLOWED"
  | "UNION_NOT_ALLOWED"
  | "NULLABLE_NOT_ALLOWED"
  | "OPTIONAL_NOT_ALLOWED"
  | "UNION_VARIANT_LIMIT"
  | "MAX_PROPERTIES_EXCEEDED";

export interface SchemaValidationIssue {
  code: SchemaValidationCode;
  severity: ValidationSeverity;
  path: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  issues: SchemaValidationIssue[];
}
