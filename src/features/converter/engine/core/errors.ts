export class ConverterError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ConverterError";
    this.code = code;
  }
}

export class JsonInputError extends ConverterError {
  readonly line: number;
  readonly column: number;
  readonly position: number | null;

  constructor(
    message: string,
    details: { line: number; column: number; position: number | null },
  ) {
    super(message, "INVALID_JSON");
    this.name = "JsonInputError";
    this.line = details.line;
    this.column = details.column;
    this.position = details.position;
  }
}
