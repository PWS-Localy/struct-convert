import { describe, expect, it } from "vitest";
import { mapGoType, mapGoFieldType } from "../../../../../../src/features/converter/engine/generators/go-type-mapper";
import type {TypeSchema} from "../../../../../../src/features/converter/engine/inference/schema";

describe("mapGoType", () => {
  it.each([
    [{ kind: "string" }, "string"],
    [{ kind: "boolean" }, "bool"],
    [{ kind: "number", integer: true }, "int64"],
    [{ kind: "number", integer: false }, "float64"],
  ])("maps %j to Go type", (schema, expected) => {
    expect(mapGoType(schema as TypeSchema)).toBe(expected);
  });

  it("maps arrays to Go slices", () => {
    expect(
      mapGoType({
        kind: "array",
        items: { kind: "string" },
      } as TypeSchema),
    ).toBe("[]string");
  });

  it("maps nullable fields to pointers when configured", () => {
    const result = mapGoFieldType({
      name: "nickname",
      type: { kind: "string" },
      nullable: true,
    } as never);
    expect(result).toContain("*");
  });

  it("applies the configured union strategy", () => {
    expect(() =>
      mapGoType(
        {
          kind: "union",
          variants: [{ kind: "string" }, { kind: "boolean" }],
        } as TypeSchema,
        undefined,
        { unionStrategy: "error" },
      ),
    ).toThrow("Union type is not supported");
  });
});
