import { describe, expect, it } from "vitest";
import { parseJson } from "../../../../../src/features/converter/engine/parser/json-parser";

describe("parseJson", () => {
  it("parses a root object", () => {
    expect(parseJson('{"name":"Ada","age":36}')).toEqual({
      name: "Ada",
      age: 36,
    });
  });

  it("parses a root array", () => {
    expect(parseJson('[{"id":1},{"id":2}]')).toEqual([
      { id: 1 },
      { id: 2 },
    ]);
  });

  it("preserves nested objects and arrays", () => {
    expect(parseJson('{"profile":{"tags":["go","ts"]}}')).toEqual({
      profile: { tags: ["go", "ts"] },
    });
  });

  it("parses primitive values nested in a document", () => {
    expect(parseJson('{"s":"x","n":1,"f":1.5,"b":true,"nil":null}')).toEqual({
      s: "x",
      n: 1,
      f: 1.5,
      b: true,
      nil: null,
    });
  });

  it("rejects malformed JSON", () => {
    expect(() => parseJson('{"name":')).toThrow();
  });

  it("rejects empty input", () => {
    expect(() => parseJson("")).toThrow();
  });

  it("rejects whitespace-only input", () => {
    expect(() => parseJson("   \n\t")).toThrow();
  });

  it("does not silently parse trailing content", () => {
    expect(() => parseJson('{"ok":true} trailing')).toThrow();
  });
});
