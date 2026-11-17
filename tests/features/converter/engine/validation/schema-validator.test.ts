import { describe, expect, it } from "vitest";
import { validateSchema } from "../../../../../src/features/converter/engine/validation/schema-validator";

describe("validateSchema", () => {
  it("accepts a valid primitive schema", () => {
    const result = validateSchema({ type: "string" });
    expect(result.valid ?? result.success).toBe(true);
  });

  it("accepts nested object and array schemas", () => {
    const result = validateSchema({
      type: "object",
      properties: {
        users: {
          type: "array",
          items: {
            type: "object",
            properties: { id: { type: "number", integer: true } },
          },
        },
      },
    });
    expect(result.valid ?? result.success).toBe(true);
  });

  it("rejects an unknown schema type", () => {
    const result = validateSchema({ type: "not-a-schema-type" });
    expect(result.valid ?? result.success).toBe(false);
  });

  it("does not mutate the supplied schema", () => {
    const schema = { type: "object", properties: { id: { type: "number" } } };
    const before = structuredClone(schema);
    validateSchema(schema);
    expect(schema).toEqual(before);
  });
});
