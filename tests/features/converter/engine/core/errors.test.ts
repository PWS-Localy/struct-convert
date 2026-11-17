import { describe, expect, it } from "vitest";
import * as errors from "../../../../../src/features/converter/engine/core/errors";

describe("Engine errors", () => {
  it("exports at least one typed engine error", () => {
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });

  it("error instances preserve a readable message", () => {
    const ErrorType = Object.values(errors).find(
      (value) => typeof value === "function" && value.prototype instanceof Error,
    ) as (new (...args: never[]) => Error) | undefined;

    if (!ErrorType) {
      throw new Error("Expected core/errors.ts to export an Error subclass");
    }

    const instance = new ErrorType();
    expect(instance).toBeInstanceOf(Error);
    expect(instance.message).toBeTruthy();
  });
});
