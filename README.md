# Struct Convert

**Convert JSON into Go Structs automatically.**

Struct Convert is a developer tool designed to generate Golang structs from JSON data automatically. Instead of manually writing Go struct definitions, developers can simply paste their JSON and instantly generate the corresponding Go structs.

The goal is to make JSON-to-Go conversion faster, easier, and more accurate.

## ✨ Features

### Core Features
- **JSON to Go Struct** — Automatically generate Go structs from JSON.
- **Object Support** — Support standard JSON objects.
- **Array Support** — Support JSON arrays, including arrays of objects.
- **Nested Objects** — Automatically generate nested structs.
- **Type Inference** — Detect string, integer, float, boolean, object, and array types.
- **JSON Tags** — Generate JSON struct tags automatically.
- **Copy Code** — Copy generated Go code to the clipboard.
- **JSON Validation** — Validate JSON syntax and display parsing errors.

### Advanced Features (Planned)
- [ ] Pointer support (`*string`, `*int`, etc.)
- [ ] `omitempty` support
- [ ] Nullable and optional field detection
- [ ] Custom struct naming
- [ ] Nested struct naming
- [ ] Mixed type handling
- [ ] Multiple JSON samples and schema merging
- [ ] TypeScript Interface Generator
- [ ] Java Class Generator
- [ ] C# Class Generator

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| TypeScript | Application and inference engine |
| Vite | Build tool |
| Monaco Editor | Code editor |
| Vitest | Unit testing |
| Oxlint | Code linting |
| Prettier | Code formatting |

## 📁 Project Structure

```text
src/
├── app/
│   ├── App.tsx
│   └── providers/
│
├── features/
│   └── converter/
│       ├── components/
│       ├── hooks/
│       ├── engine/
│       │   ├── parser/
│       │   ├── inference/
│       │   ├── generators/
│       │   │   └── golang/
│       │   └── core/
│       ├── types/
│       ├── constants/
│       └── index.ts
│
├── components/
│   └── ui/
│
├── lib/
├── utils/
├── styles/
│
├── App.tsx
└── main.tsx
```

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd struct-convert
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local development URL provided by Vite.

## 💡 Usage

1. Open Struct Convert.
2. Paste your JSON into the input editor.
3. Select the desired Go struct options.
4. View the generated Go structs.
5. Copy the generated code and use it in your Go project.

### Example

**Input JSON**

```json
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "is_active": true,
  "profile": {
    "age": 25,
    "address": "Bangkok"
  }
}
```

**Generated Go Struct**

```go
type User struct {
    ID       int     `json:"id"`
    Name     string  `json:"name"`
    Email    string  `json:"email"`
    IsActive bool    `json:"is_active"`
    Profile  Profile `json:"profile"`
}

type Profile struct {
    Age     int    `json:"age"`
    Address string `json:"address"`
}
```

## 🧠 Architecture

Struct Convert uses a schema-based architecture to separate JSON parsing, type inference, and code generation.

```text
JSON Input
    |
    v
JSON Parser
    |
    v
Schema Inference
    |
    v
Schema Normalization
    |
    v
Go Struct Generator
    |
    v
Generated Go Code
```

### Engine Responsibilities

| Module | Responsibility |
|---|---|
| Parser | Parse and validate JSON input |
| Type Inference | Detect JSON value types |
| Object Inference | Analyze object properties |
| Array Inference | Analyze array elements |
| Type Merge | Merge different types and object schemas |
| Go Generator | Generate Golang struct definitions |
| Go Type Mapper | Map inferred types to Go types |
| Go Naming | Convert JSON field names to Go naming conventions |
| Go Tags | Generate JSON struct tags |

### Design Principles

- Keep the inference engine independent from React.
- Separate schema analysis from code generation.
- Use reusable schema models.
- Make the architecture extensible for additional programming languages.
- Maintain predictable and testable type inference rules.

## 🧪 Testing

Run unit tests:

```bash
npm run test
```

Run tests with coverage:

```bash
npm run test -- --coverage
```

## 🔍 Code Quality

Run Oxlint:

```bash
npx oxlint .
```

Run ESLint (if configured):

```bash
npx eslint .
```

Format code:

```bash
npx prettier --write .
```

## 🗺️ Roadmap

- [x] Initialize React + TypeScript + Vite project
- [ ] Implement JSON Parser
- [ ] Implement Type Inference Engine
- [ ] Implement Schema Merge
- [ ] Implement Go Struct Generator
- [ ] Support JSON Object and Array
- [ ] Implement JSON Tags
- [ ] Build Converter UI
- [ ] Add Unit Tests
- [ ] Add Advanced Generator Options
- [ ] Support Multiple Programming Languages

## 🤝 Contributing

Contributions, ideas, and suggestions are welcome.

If you find a bug or have an idea for improvement, feel free to open an issue or submit a pull request.

## 📄 License

This project is currently under development. License details will be added later.
