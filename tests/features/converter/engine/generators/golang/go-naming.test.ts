// import { describe, expect, it } from "vitest";
// import { toGoExportedName, toGoFieldName } from "../../../../../../src/features/converter/engine/generators/golang/go-naming";

// describe("Go naming", () => {
//   it.each([
//     ["user_name", "UserName"],
//     ["user-name", "UserName"],
//     ["user name", "UserName"],
//     ["userID", "UserID"],
//   ])("converts %s to exported Go name", (input, expected) => {
//     expect(toGoExportedName(input)).toBe(expected);
//   });

//   it("avoids Go keywords", () => {
//     const name = toGoFieldName("type");
//     expect(name.toLowerCase()).not.toBe("type");
//   });

//   it("handles names beginning with digits", () => {
//     expect(toGoExportedName("2fa")).toMatch(/^[A-Z]/);
//   });

//   it("handles empty and punctuation-only names safely", () => {
//     expect(toGoExportedName("")).toBeTruthy();
//     expect(toGoExportedName("---")).toBeTruthy();
//   });
// });


import { describe, expect, it } from "vitest";
import {
  toGoExportedName,
  toGoFieldName,
  toGoTypeName,
  uniqueGoName,
} from "../../../../../../src/features/converter/engine/generators//go-naming";

describe("Go naming", () => {
  it.each([
    ["user_name", "UserName"],
    ["user-name", "UserName"],
    ["user name", "UserName"],
    ["userName", "UserName"],
    ["userID", "UserID"],
    ["api_url", "APIURL"],
    ["http_status_code", "HTTPStatusCode"],
    ["created_at", "CreatedAt"],
  ])("converts %s to %s", (input, expected) => {
    expect(toGoExportedName(input)).toBe(expected);
  });

  it("prefixes identifiers that start with a digit", () => {
    expect(toGoExportedName("2fa")).toBe("Field2FA");
  });

  it("returns a safe fallback for empty and punctuation-only names", () => {
    expect(toGoExportedName("")).toBe("Field");
    expect(toGoExportedName("---")).toBe("Field");
  });

  it("avoids Go keywords", () => {
    expect(toGoFieldName("type")).toBe("TypeField");
    expect(toGoTypeName("func")).toBe("FuncField");
  });

  it("resolves duplicate names deterministically", () => {
    const used = new Set<string>();
    expect(uniqueGoName("user_id", used)).toBe("UserID");
    expect(uniqueGoName("user-id", used)).toBe("UserID2");
    expect(uniqueGoName("user_id", used)).toBe("UserID3");
  });
});