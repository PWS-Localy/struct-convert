import { describe, expect, it } from "vitest";
import { validateTypeConstraints } from "../../../../../src/features/converter/engine/validation/type-constraints";

describe("validateTypeConstraints", () => {
  it("accepts supported primitive constraints", () => {
    expect(() =>
      validateTypeConstraints({ type: "number", integer: true }),
    ).not.toThrow();
  });

  it("rejects contradictory constraints", () => {
    expect(() =>
      validateTypeConstraints({ type: "string", integer: true }),
    ).toThrow();
  });

  it("rejects invalid array item definitions", () => {
    expect(() =>
      validateTypeConstraints({ type: "array", items: null }),
    ).toThrow();
  });
});
