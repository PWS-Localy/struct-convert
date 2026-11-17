# Struct Convert

**Struct Convert** is a modern, lightweight JSON-to-Struct conversion tool designed to make generating strongly typed data structures simple and efficient.

It analyzes JSON input, infers its data types and structure, and generates corresponding code for the target programming language.

The project focuses on accuracy, flexibility, and extensibility through a modular conversion engine.

## Features

- **JSON Object Support** — Convert JSON objects into structured types.
- **JSON Array Support** — Analyze arrays of objects and infer a common schema.
- **Nested Structures** — Support deeply nested objects and arrays.
- **Type Inference** — Automatically detect strings, numbers, integers, decimals, booleans, nulls, objects, and arrays.
- **Optional Fields** — Detect fields that are missing from some objects in an array.
- **Nullable Fields** — Distinguish between optional fields and fields that can contain `null`.
- **Union Types** — Handle fields with different types across multiple samples.
- **Schema Normalization** — Merge and normalize inferred schemas into a consistent structure.
- **Schema Validation** — Validate schema structure and enforce type constraints.
- **Extensible Generators** — Designed to support multiple programming languages.
- **Client-side Processing** — JSON conversion runs locally in the browser without requiring a backend.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | UI development |
| TypeScript | Type-safe application and engine |
| Vite | Development server and build tool |
| Monaco Editor | JSON input and code output editor |
| Vitest | Unit testing |
| Prettier | Code formatting |
| Oxlint | Code linting |
| gofmt | Go code formatting |

## Architecture

The project follows a feature-based architecture. The converter engine is separated from the UI to keep its logic reusable, testable, and independent of the presentation layer.

```text
src/
├── app/
│   ├── App.tsx
│   └── providers/
│
├── features/
│   └── converter/
│       ├── components/
│       │   ├── JsonEditor.tsx
│       │   ├── StructViewer.tsx
│       │   ├── ConverterOptions.tsx
│       │   └── ConverterToolbar.tsx
│       │
│       ├── hooks/
│       │   └── useConverter.ts
│       │
│       ├── engine/
│       │   ├── parser/
│       │   │   └── json-parser.ts
│       │   │
│       │   ├── inference/
│       │   │   ├── infer-schema.ts
│       │   │   ├── infer-type.ts
│       │   │   ├── merge-types.ts
│       │   │   ├── infer-object.ts
│       │   │   ├── infer-array.ts
│       │   │   └── schema.ts
│       │   │
│       │   ├── generators/
│       │   │   └── golang/
│       │   │       ├── go-generator.ts
│       │   │       ├── go-type-mapper.ts
│       │   │       ├── go-naming.ts
│       │   │       └── go-tags.ts
│       │   │
│       │   └── core/
│       │       └── errors.ts
│       │
│       ├── types/
│       │   └── converter.types.ts
│       │
│       ├── constants/
│       │   └── default-options.ts
│       │
│       └── index.ts
│
├── components/
│   └── ui/
│
├── lib/
├── utils/
├── styles/
├── App.tsx
└── main.tsx
```

Additional engine modules, such as schema normalization and validation, may be added within the existing engine structure as the project evolves.

## Conversion Pipeline

The conversion engine follows a modular pipeline:

```text
JSON Input
    │
    ▼
JSON Parser
    │
    ▼
Type Inference
    │
    ▼
Schema Normalization
    │
    ▼
Schema Validation
    │
    ▼
Code Generator
    │
    ▼
Generated Struct
```

### 1. JSON Parser

Parses the input JSON string and handles invalid JSON with meaningful errors.

Supported input:
- JSON Object
- JSON Array
- Nested objects
- Nested arrays

### 2. Type Inference

Analyzes parsed JSON values and generates an initial schema.

Supported types:
- String
- Integer
- Decimal
- Boolean
- Null
- Object
- Array
- Union

It also identifies optional and nullable fields when analyzing multiple objects.

### 3. Schema Normalization

Converts inferred schemas into a consistent canonical representation.

Responsibilities:
- Flatten nested union types.
- Remove duplicate type variants.
- Merge compatible object schemas.
- Normalize number types.
- Handle nullability.
- Preserve array metadata.
- Produce deterministic schema output.

### 4. Schema Validation

Validates the normalized schema before code generation.

Responsibilities:
- Validate schema structure and metadata.
- Detect invalid or unsupported types.
- Enforce configurable type constraints.
- Limit schema depth and complexity.
- Report validation issues with their corresponding paths.

### 5. Code Generator

Transforms the validated schema into source code for the selected programming language.

The initial generator targets Go.

## Example

### Input

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "active": true,
    "profile": {
      "age": 25
    }
  },
  {
    "id": 2,
    "name": "Bob",
    "active": false,
    "profile": {
      "age": 30
    }
  }
]
```

### Generated Go Struct

```go
type User struct {
    ID      int     `json:"id"`
    Name    string  `json:"name"`
    Email   *string `json:"email,omitempty"`
    Active  bool    `json:"active"`
    Profile Profile `json:"profile"`
}

type Profile struct {
    Age int `json:"age"`
}
```

*The generated output is illustrative. Actual output depends on generator options and type-mapping rules.*

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
git clone <repository-url>
cd struct-convert
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

## Design Principles

### 1. Separation of Concerns

The UI, parsing, inference, validation, and code generation layers are independent.

### 2. Type Safety

Use TypeScript to maintain predictable schema structures and reduce runtime errors.

### 3. Extensibility

The engine should support additional programming languages without changing the core inference logic.

### 4. Testability

Core engine modules should be independently testable without depending on React components.

### 5. Deterministic Output

The same input and configuration should produce consistent schema and generated code.

## Roadmap

### Phase 1 — Core Engine
- [x] Project architecture
- [ ] JSON Parser
- [ ] Type Inference Engine
- [ ] Schema Normalization
- [ ] Schema Validator
- [ ] Type Constraints
- [ ] Core Engine Tests

### Phase 2 — Go Generator
- [ ] Go Type Mapper
- [ ] Go Naming Rules
- [ ] Go Struct Generator
- [ ] JSON Tags
- [ ] Go Formatting

### Phase 3 — User Interface
- [ ] JSON Editor
- [ ] Generated Struct Viewer
- [ ] Converter Options
- [ ] Copy Generated Code
- [ ] Error and Warning Display

### Phase 4 — Advanced Features
- [ ] Multiple Root Types
- [ ] Advanced Type Mapping
- [ ] Additional Programming Languages
- [ ] Custom Naming Rules
- [ ] Import and Export Options

## Project Philosophy

Struct Convert is designed to be more than a simple JSON-to-Struct converter.

Its core is a reusable schema inference engine that understands data structures, handles inconsistencies, and provides a foundation for generating strongly typed code across multiple programming languages.

---

**Built with React and TypeScript.**