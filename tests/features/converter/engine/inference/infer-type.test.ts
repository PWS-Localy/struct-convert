import { describe, expect, it } from "vitest";
import { inferType } from "../../../../../src/features/converter/engine/inference/infer-type";

describe("inferType", () => {
  it("infers string", () => {
    expect(inferType("hello").type).toBe("string");
  });

  it("infers integer numbers", () => {
    const result = inferType(42);
    expect(result.type).toBe("number");
    expect(result.integer).toBe(true);
  });

  it("infers decimal numbers", () => {
    const result = inferType(3.14);
    expect(result.type).toBe("number");
    expect(result.integer).toBe(false);
  });

  it("infers boolean and null", () => {
    expect(inferType(true).type).toBe("boolean");
    expect(inferType(null).type).toBe("null");
  });

  it("infers object and array roots", () => {
    expect(inferType({ id: 1 }).type).toBe("object");
    expect(inferType([{ id: 1 }]).type).toBe("array");
  });

  it("handles an empty array without crashing", () => {
    const result = inferType([]);
    expect(result.type).toBe("array");
  });

  it("does not mutate the input", () => {
    const input = { user: { name: "Ada" }, values: [1, 2] };
    const before = structuredClone(input);
    inferType(input);
    expect(input).toEqual(before);
  });
});
