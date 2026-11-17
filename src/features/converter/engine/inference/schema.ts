export type PrimitiveKind =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "any";

export type RootKind = "object" | "array" | "string" | "number" | "boolean" | "null";

export interface StringSchema { kind: "string"; }
export interface NumberSchema {
  kind: "number";
  integer?: boolean;
}
export interface BooleanSchema { kind: "boolean"; }
export interface NullSchema { kind: "null"; }
export interface AnySchema { kind: "any"; }

export type PrimitiveSchema =
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | NullSchema
  | AnySchema;

export interface ObjectSchema {
  kind: "object";
  sampleCount: number;
  properties: Record<string, FieldSchema>;
}

export interface ArraySchema {
  kind: "array";
  items: TypeSchema;
  minLength: number;
  maxLength: number;
  sampleCount: number;
  empty: boolean;
}

export interface UnionSchema {
  kind: "union";
  variants: TypeSchema[];
}

export type TypeSchema =
  | PrimitiveSchema
  | ObjectSchema
  | ArraySchema
  | UnionSchema;

export interface FieldSchema {
  type: TypeSchema;
  optional: boolean; // optional หมายถึง Field บาง Object ไม่มี Property นี้
  nullable: boolean; // nullable หมายถึง Field มีค่าเป็น null ได้
  presentCount: number; // presentCount และ totalCount ใช้ตรวจสอบ Field ที่ไม่ปรากฏครบทุก Object
  totalCount: number;
}

export type ConflictStrategy = "any" | "strict" | "union";

export interface InferenceOptions {
  conflictStrategy?: ConflictStrategy;
}

export interface InferenceWarning {
  code: "TYPE_CONFLICT" | "EMPTY_ARRAY" | "UNKNOWN_TYPE";
  path: string;
  message: string;
}

export interface InferenceResult {
  schema: TypeSchema;
  warnings: InferenceWarning[];
}
