// import { describe, expect, it } from "vitest";
// import { generateGo } from "../../../../../../src/features/converter/engine/generators/golang/go-generator";

// describe("generateGo", () => {
//   it("generates a Go struct for a root object", () => {
//     const output = generateGo({
//       type: "object",
//       properties: {
//         id: { type: "number", integer: true },
//         name: { type: "string" },
//       },
//     } as never, { structName: "User" } as never);

//     expect(output).toContain("type User struct");
//     expect(output).toContain("int64");
//     expect(output).toContain("string");
//     expect(output).toContain('json:"id"');
//   });

//   it("generates nested structs", () => {
//     const output = generateGo({
//       type: "object",
//       properties: {
//         profile: {
//           type: "object",
//           properties: { active: { type: "boolean" } },
//         },
//       },
//     } as never, { structName: "User" } as never);

//     expect(output).toContain("type User struct");
//     expect(output).toContain("Profile");
//     expect(output).toContain("bool");
//   });

//   it("generates slices for array fields", () => {
//     const output = generateGo({
//       type: "object",
//       properties: {
//         tags: { type: "array", items: { type: "string" } },
//       },
//     } as never, { structName: "User" } as never);

//     expect(output).toContain("[]string");
//   });

//   it("supports a root array of objects", () => {
//     const output = generateGo({
//       type: "array",
//       items: {
//         type: "object",
//         properties: { id: { type: "number", integer: true } },
//       },
//     } as never, { structName: "User" } as never);

//     expect(output).toContain("[]");
//     expect(output).toContain("User");
//   });

//   it("returns deterministic output for the same input", () => {
//     const schema = {
//       type: "object",
//       properties: { id: { type: "number", integer: true }, name: { type: "string" } },
//     };
//     expect(generateGo(schema as never, { structName: "User" } as never))
//       .toBe(generateGo(schema as never, { structName: "User" } as never));
//   });
// });

import { describe, expect, it } from "vitest";
import { generateGo } from "../../../../../../src/features/converter/engine/generators/go-generator";

describe("generateGo", () => {
  it("generates a root struct with primitive fields and JSON tags", () => {
    const output = generateGo({
      type: "object",
      properties: {
        id: { type: { type: "number", integer: true } },
        name: { type: { type: "string" } },
        active: { type: { type: "boolean" } },
        score: { type: { type: "number", integer: false } },
      },
    }, { rootName: "User" });

    expect(output).toContain("package models");
    expect(output).toContain("type User struct");
    expect(output).toContain("ID int64 `json:\"id\"`");
    expect(output).toContain("Name string `json:\"name\"`");
    expect(output).toContain("Active bool `json:\"active\"`");
    expect(output).toContain("Score float64 `json:\"score\"`");
  });

  it("generates nested structs and references their named types", () => {
    const output = generateGo({
      type: "object",
      properties: {
        profile: {
          type: {
            type: "object",
            properties: {
              display_name: { type: { type: "string" } },
            },
          },
        },
      },
    }, { rootName: "User" });

    expect(output).toContain("type UserProfile struct");
    expect(output).toContain("type User struct");
    expect(output).toContain("Profile UserProfile");
    expect(output).toContain("DisplayName string");
  });

  it("generates slices for primitive arrays", () => {
    const output = generateGo({
      type: "object",
      properties: {
        tags: { type: { type: "array", items: { type: "string" } } },
      },
    }, { rootName: "User" });

    expect(output).toContain("Tags []string");
  });

  it("generates slices of named structs for arrays of objects", () => {
    const output = generateGo({
      type: "object",
      properties: {
        users: {
          type: {
            type: "array",
            items: {
              type: "object",
              properties: { id: { type: { type: "number", integer: true } } },
            },
          },
        },
      },
    }, { rootName: "Response" });

    expect(output).toContain("Users []ResponseUsersItem");
    expect(output).toContain("type ResponseUsersItem struct");
  });

  it("uses pointers and omitempty for optional and nullable fields", () => {
    const output = generateGo({
      type: "object",
      properties: {
        optional_name: {
          type: { type: "string" },
          optional: true,
        },
        nullable_age: {
          type: { type: "number", integer: true },
          nullable: true,
        },
      },
    }, { rootName: "User" });

    expect(output).toContain("OptionalName *string `json:\"optional_name,omitempty\"`");
    expect(output).toContain("NullableAge *int64 `json:\"nullable_age\"`");
  });

  it("supports pointer strategy configuration", () => {
    const schema = {
      type: "object" as const,
      properties: {
        missing: { type: { type: "string" as const }, optional: true },
        nullable: { type: { type: "string" as const }, nullable: true },
      },
    };

    const output = generateGo(schema, {
      rootName: "Record",
      pointerStrategy: "missing",
    });

    expect(output).toContain("Missing *string");
    expect(output).toContain("Nullable string");
  });

  it("supports a root array of objects", () => {
    const output = generateGo({
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: { type: "number", integer: true } },
        },
      },
    }, { rootName: "User" });

    expect(output).toContain("type User struct");
    expect(output).toContain("var users []User");
  });

  it("maps null, any and union values to any", () => {
    const output = generateGo({
      type: "object",
      properties: {
        raw: { type: { type: "any" } },
        choice: {
          type: {
            type: "union",
            variants: [{ type: "string" }, { type: "boolean" }],
          },
        },
      },
    }, { rootName: "Payload" });

    expect(output).toContain("Raw any");
    expect(output).toContain("Choice any");
  });

  it("supports package and tag configuration", () => {
    const output = generateGo({
      type: "object",
      properties: { id: { type: { type: "number", integer: true } } },
    }, {
      rootName: "Item",
      packageName: "dto",
      jsonTags: false,
    });

    expect(output).toContain("package dto");
    expect(output).toContain("ID int64");
    expect(output).not.toContain("json:");
  });

  it("produces deterministic output", () => {
    const schema = {
      type: "object" as const,
      properties: { id: { type: { type: "number" as const, integer: true } } },
    };
    expect(generateGo(schema, { rootName: "User" }))
      .toBe(generateGo(schema, { rootName: "User" }));
  });
});