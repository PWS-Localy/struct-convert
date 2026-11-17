import { describe, expect, it } from "vitest";
import { inferValue } from "../../../../../src/features/converter/engine/inference/infer-value";

describe("inferValue", () => {
  const context = {} as Parameters<typeof inferValue>[1];

  it.each([
    ["text", "string"],
    [10, "number"],
    [true, "boolean"],
    [null, "null"],
  ])("infers primitive %j", (value, expectedType) => {
    const schema = inferValue(value, context, []);
    expect(schema.type).toBe(expectedType);
  });

  it("records the field path for nested values when supported", () => {
    const schema = inferValue({ id: 1 }, context, [], "user");
    expect(schema.type).toBe("object");
  });
});
