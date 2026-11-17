import { describe, expect, it } from "vitest";
import { inferObject } from "../../../../../src/features/converter/engine/inference/infer-object";

describe("inferObject", () => {
  const context = {} as Parameters<typeof inferObject>[1];

  it("infers properties from object samples", () => {
    const schema = inferObject([{ id: 1, name: "Ada" }], context, []);
    expect(schema.type).toBe("object");
    expect(schema.properties).toHaveProperty("id");
    expect(schema.properties).toHaveProperty("name");
  });

  it("marks a field missing from some samples as optional", () => {
    const schema = inferObject(
      [{ id: 1, nickname: "A" }, { id: 2 }],
      context,
      [],
    );
    expect(schema.properties.nickname.optional).toBe(true);
  });

  it("distinguishes nullable values from optional values", () => {
    const schema = inferObject(
      [{ id: 1, middleName: null }, { id: 2, middleName: "B" }],
      context,
      [],
    );
    expect(schema.properties.middleName.nullable).toBe(true);
  });

  it("handles empty object samples", () => {
    const schema = inferObject([{}], context, []);
    expect(schema.type).toBe("object");
  });
});
