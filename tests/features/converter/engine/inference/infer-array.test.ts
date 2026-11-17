import { describe, expect, it } from "vitest";
import { inferArray } from "../../../../../src/features/converter/engine/inference/infer-array";

describe("inferArray", () => {
  const context = {} as Parameters<typeof inferArray>[1];

  it("infers homogeneous primitive arrays", () => {
    const schema = inferArray(["a", "b"], context, []);
    expect(schema.type).toBe("array");
    expect(schema.items.type).toBe("string");
  });

  it("merges object properties across array elements", () => {
    const schema = inferArray(
      [{ id: 1, name: "A" }, { id: 2, active: true }],
      context,
      [],
    );
    expect(schema.type).toBe("array");
    expect(schema.items.type).toBe("object");
  });

  it("handles mixed element types", () => {
    const schema = inferArray([1, "one"], context, []);
    expect(schema.type).toBe("array");
    expect(schema.items).toBeDefined();
  });

  it("handles empty arrays", () => {
    const schema = inferArray([], context, []);
    expect(schema.type).toBe("array");
  });

  it("supports nested arrays", () => {
    const schema = inferArray([[1, 2], [3]], context, []);
    expect(schema.type).toBe("array");
    expect(schema.items.type).toBe("array");
  });
});
