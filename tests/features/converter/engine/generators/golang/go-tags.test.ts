// import { describe, expect, it } from "vitest";
// import { buildGoTags } from "../../../../../../src/features/converter/engine/generators/golang/go-tags";

// describe("buildGoTags", () => {
//   it("creates a json tag from the source field name", () => {
//     expect(buildGoTags("user_name")).toContain('json:"user_name"');
//   });

//   it("supports omitempty for optional fields", () => {
//     expect(buildGoTags("nickname", { optional: true })).toContain("omitempty");
//   });

//   it("does not add omitempty to required fields by default", () => {
//     expect(buildGoTags("id", { optional: false })).not.toContain("omitempty");
//   });
// });

import { describe, expect, it } from "vitest";
import {
  buildGoTags,
  formatGoTag,
} from "../../../../../../src/features/converter/engine/generators/go-tags";

describe("Go tags", () => {
  it("creates a JSON tag using the original field name", () => {
    expect(buildGoTags("user_name")).toBe('json:"user_name"');
  });

  it("adds omitempty for optional fields", () => {
    expect(buildGoTags("nickname", { optional: true }))
      .toBe('json:"nickname,omitempty"');
  });

  it("does not add omitempty to required fields by default", () => {
    expect(buildGoTags("id", { optional: false }))
      .toBe('json:"id"');
  });

  it("supports an explicit JSON name", () => {
    expect(buildGoTags("UserID", { jsonName: "user_id" }))
      .toBe('json:"user_id"');
  });

  it("can disable JSON tags", () => {
    expect(buildGoTags("id", { json: false })).toBe("");
    expect(formatGoTag("id", { json: false })).toBe("");
  });

  it("wraps tags with backticks for struct fields", () => {
    expect(formatGoTag("id")).toBe('`json:"id"`');
  });

  it("escapes quote characters in tag values", () => {
    expect(buildGoTags('a"b')).toBe('json:"a\\"b"');
  });
});