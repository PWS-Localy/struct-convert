import { JsonInputError } from "../core/errors";
import type { RootKind } from "../inference/schema";

/** A JSON value accepted by JSON.parse. */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface ParsedJson {
  data: JsonValue;
  rootKind: RootKind;
}

export type ParseJsonResult =
  | { success: true; value: ParsedJson }
  | { success: false; error: JsonInputError };

function getRootKind(value: JsonValue): RootKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
  }
}

function extractPosition(message: string): number | null {
  const patterns = [
    /position\s+(\d+)/i,
    /at\s+(\d+)\s*$/i,
    /column\s+(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      const parsed = Number(match[1]);
      if (Number.isInteger(parsed) && parsed >= 0) return parsed;
    }
  }

  return null;
}

function getLineAndColumn(
  source: string,
  position: number | null,
): { line: number; column: number } {
  if (position === null) {
    return { line: 1, column: 1 };
  }

  const safePosition = Math.min(Math.max(position, 0), source.length);
  const precedingText = source.slice(0, safePosition);
  const lines = precedingText.split("\n");

  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

export function parseJson(input: string): ParseJsonResult {
  if (input.trim().length === 0) {
    return {
      success: false,
      error: new JsonInputError("กรุณาป้อน JSON ก่อนเริ่มแปลงข้อมูล", {
        line: 1,
        column: 1,
        position: 0,
      }),
    };
  }

  try {
    const data: JsonValue = JSON.parse(input) as JsonValue;

    return {
      success: true,
      value: {
        data,
        rootKind: getRootKind(data),
      },
    };
  } catch (cause) {
    const nativeMessage =
      cause instanceof Error ? cause.message : "Invalid JSON input";
    const position = extractPosition(nativeMessage);
    const location = getLineAndColumn(input, position);

    return {
      success: false,
      error: new JsonInputError(
        `รูปแบบ JSON ไม่ถูกต้อง: ${nativeMessage}`,
        { ...location, position },
      ),
    };
  }
}
