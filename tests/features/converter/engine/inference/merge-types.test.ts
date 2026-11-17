import { describe, expect, it } from "vitest";
import { mergeTypes } from "../../../../../src/features/converter/engine/inference/merge-types";

describe("mergeTypes", () => {
  const context = {} as Parameters<typeof mergeTypes>[2];

  it("keeps matching primitive types", () => {
    const merged = mergeTypes(
      { type: "string" } as Parameters<typeof mergeTypes>[0],
      { type: "string" } as Parameters<typeof mergeTypes>[1],
      context,
    );
    expect(merged.type).toBe("string");
  });

  it("merges integer and decimal number metadata", () => {
    const merged = mergeTypes(
      { type: "number", integer: true } as Parameters<typeof mergeTypes>[0],
      { type: "number", integer: false } as Parameters<typeof mergeTypes>[1],
      context,
    );
    expect(merged.type).toBe("number");
    expect(merged.integer).toBe(false);
  });

  it("does not lose nullability when merging null with a value type", () => {
    const merged = mergeTypes(
      { type: "string" } as Parameters<typeof mergeTypes>[0],
      { type: "null" } as Parameters<typeof mergeTypes>[1],
      context,
    );
    expect(merged.nullable).toBe(true);
  });

  it("represents incompatible types as a union or configured fallback", () => {
    const merged = mergeTypes(
      { type: "string" } as Parameters<typeof mergeTypes>[0],
      { type: "boolean" } as Parameters<typeof mergeTypes>[1],
      context,
    );
    expect(["union", "any"]).toContain(merged.type);
  });

  it("is safe when merging equivalent schemas in reverse order", () => {
    const left = { type: "number", integer: true } as Parameters<typeof mergeTypes>[0];
    const right = { type: "number", integer: false } as Parameters<typeof mergeTypes>[1];
    expect(mergeTypes(left, right, context)).toEqual(mergeTypes(right, left, context));
  });
});
