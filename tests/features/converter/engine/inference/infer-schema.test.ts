import { describe, expect, it } from "vitest";
import { inferSchema } from "../../../../../src/features/converter/engine/inference/infer-schema";

describe("inferSchema", () => {
  it("infers a simple object schema", () => {
    const result = inferSchema({ name: "Ada", age: 36 });
    expect(result.schema ?? result).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        name: expect.objectContaining({ type: "string" }),
        age: expect.objectContaining({ type: "number" }),
      }),
    });
  });

  it("supports a root array of objects", () => {
    const result = inferSchema([{ id: 1 }, { id: 2, label: "two" }]);
    expect(result.schema ?? result).toMatchObject({ type: "array" });
  });

  it("infers nested objects and arrays", () => {
    const result = inferSchema({
      account: { active: true },
      roles: ["admin", "editor"],
    });
    expect(result.schema ?? result).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        account: expect.objectContaining({ type: "object" }),
        roles: expect.objectContaining({ type: "array" }),
      }),
    });
  });

  it("returns warnings/metadata in a stable collection shape", () => {
    const result = inferSchema({ values: [] });
    expect(result).toHaveProperty("warnings");
  });
});
