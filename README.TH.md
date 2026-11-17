# Struct Convert

**Struct Convert** คือเครื่องมือแปลง JSON ให้เป็น Struct หรือโครงสร้างข้อมูลของภาษาโปรแกรมมิ่งต่าง ๆ ที่ออกแบบมาให้ใช้งานง่าย รวดเร็ว และมีความยืดหยุ่น

ระบบจะวิเคราะห์ข้อมูล JSON ที่ได้รับ ทำการตรวจจับและอนุมานชนิดข้อมูล (Type Inference) สร้าง Schema ที่เป็นมาตรฐาน และนำไปสร้าง Source Code ตามภาษาที่ต้องการ

โปรเจกต์นี้ให้ความสำคัญกับความถูกต้องของข้อมูล การแยกส่วนการทำงาน และความสามารถในการขยายระบบในอนาคต

## Features

- **รองรับ JSON Object** — แปลง JSON Object ให้เป็นโครงสร้างข้อมูล
- **รองรับ JSON Array** — วิเคราะห์ Array ของ Object และรวมโครงสร้างให้เป็น Schema เดียวกัน
- **Nested Structures** — รองรับ Object และ Array ที่ซ้อนกันหลายระดับ
- **Type Inference** — ตรวจจับชนิดข้อมูลอัตโนมัติ เช่น String, Number, Integer, Decimal, Boolean, Null, Object และ Array
- **Optional Fields** — ตรวจจับ Field ที่อาจไม่มีอยู่ในบาง Object
- **Nullable Fields** — แยกความแตกต่างระหว่าง Field ที่ไม่มีอยู่กับ Field ที่มีค่าเป็น `null`
- **Union Types** — รองรับ Field ที่มีชนิดข้อมูลแตกต่างกันในแต่ละตัวอย่าง
- **Schema Normalization** — รวมและจัดรูปแบบ Schema ให้เป็นมาตรฐานเดียวกัน
- **Schema Validation** — ตรวจสอบความถูกต้องของ Schema และกำหนดข้อจำกัดของชนิดข้อมูล
- **Extensible Generators** — ออกแบบให้รองรับการสร้าง Code ได้หลายภาษา
- **Client-side Processing** — ประมวลผล JSON ภายใน Browser โดยไม่จำเป็นต้องมี Backend

## Tech Stack

| Technology | วัตถุประสงค์ |
|---|---|
| React | พัฒนา User Interface |
| TypeScript | พัฒนา Application และ Engine แบบ Type-safe |
| Vite | Development Server และ Build Tool |
| Monaco Editor | Editor สำหรับ JSON Input และ Code Output |
| Vitest | Unit Testing |
| Prettier | จัดรูปแบบ Code |
| Oxlint | ตรวจสอบคุณภาพ Code |
| gofmt | จัดรูปแบบ Go Code |

## Architecture

โปรเจกต์ใช้แนวคิด Feature-based Architecture โดยแยกส่วนการทำงานของ Converter Engine ออกจาก User Interface เพื่อให้ Core Logic สามารถนำกลับมาใช้ซ้ำ ทดสอบ และพัฒนาต่อได้โดยไม่ขึ้นอยู่กับ UI

```text
src/
├── assets/
|
├── components/
│   |── converter/
|   |     |── JsonEditor.tsx
│   |     ├── StructViewer.tsx
│   |     ├── ConverterOptions.tsx
│   |     └── ConverterToolbar.tsx
|   |
|   └── ui/
|
├── features/
│   |── converter/
│   |    ├── engine/
│   |    │   |── core/
│   |    │   |    └── errors.ts
|   |    |   |    
│   |    │   ├── generators/ ( แปลง Schema เป็น Code ของแต่ละภาษา )
│   |    │   │    ├── go-generator.ts ( สร้าง Go Struct Code )
│   |    │   │    ├── go-naming.ts ( จัดการชื่อ Struct และ Field ตาม Convention ของ Go )
│   |    │   │    ├── go-tags.ts ( สร้าง JSON Tags )
│   |    │   │    └── go-type-mapper.ts ( แปลง Schema เป็น Go Types )
|   |    |   |
│   |    │   ├── inference/ ( วิเคราะห์ Type และสร้าง Schema )
│   |    │   │   ├── inndex.ts
│   |    │   │   ├── infer-array.ts ( วิเคราะห์ Array และรวม Type ของสมาชิก )
│   |    │   │   ├── infer-object.ts (	วิเคราะห์ Object และ Field )
│   |    │   │   ├── infer-schema.ts 
│   |    │   │   ├── infer-type.ts ( วิเคราะห์ Type ของ Value เป็น Public Entry Point ) 
│   |    │   │   ├── infer-value.ts ( ตรวจสอบ Value และ Dispatch )
│   |    │   │   ├── merge-types.ts ( รวม Type จากหลายตัวอย่าง )
│   |    │   │   ├── normalize-schema.ts ( แปลงเป็น Canonical Schema )
│   |    │   │   └── schema.ts 	( นิยาม Schema กลาง )
│   |    │   │   
│   |    │   ├── parser/ ( แปลง JSON String เป็นข้อมูล )
│   |    │   │   └── json-parser.ts
│   |    │   │
│   |    │   ├── validation/
│   |    │   │   |── schema-validator.ts ( ตรวจสอบ Schema )
│   |    │   │   └── type-constraints.ts ( ตรวจเงื่อนไขและข้อจำกัดของ Type )
│   |    │   │
|   |    |   └──index.ts
|   |    |
│   |    └──  hooks/
│   |          └── useConverter.ts
│   |
│   └── index.ts
│
├── httpsRequest/ ( axios https)
│   └── createHttpRequest.ts
│   └── index.ts
|
├── layouts/
|
├── pages/
|
├── service/ ( Business Logic / API )
|
│
├── lib/
├── utils/
├── styles/
├── App.tsx
└── main.tsx
```

สามารถเพิ่ม Module ใหม่ เช่น Schema Normalization และ Validation ภายใน Engine เดิมได้ โดยไม่จำเป็นต้องเปลี่ยนโครงสร้างหลักของโปรเจกต์

## Conversion Pipeline

กระบวนการทำงานของ Converter Engine ถูกแบ่งออกเป็นขั้นตอนดังนี้

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

ทำหน้าที่แปลง JSON String ให้เป็นข้อมูลที่สามารถนำไปประมวลผลต่อได้ พร้อมจัดการกรณี JSON ไม่ถูกต้องและส่ง Error ที่เหมาะสม

รองรับ:
- JSON Object
- JSON Array
- Nested Object
- Nested Array

### 2. Type Inference

วิเคราะห์ข้อมูล JSON เพื่ออนุมานชนิดข้อมูลและสร้าง Schema เบื้องต้น

ชนิดข้อมูลที่รองรับ:
- String
- Integer
- Decimal
- Boolean
- Null
- Object
- Array
- Union

นอกจากนี้ยังตรวจจับ Optional และ Nullable Fields จากการวิเคราะห์ Object หลายตัวอย่างได้

### 3. Schema Normalization

ทำหน้าที่จัดรูปแบบ Schema ที่ได้จาก Type Inference ให้เป็นมาตรฐานเดียวกัน

ความรับผิดชอบ:
- รวม Union Types ที่ซ้อนกันให้เป็นระดับเดียว
- ลบ Type Variants ที่ซ้ำกัน
- รวม Object Schema ที่มีโครงสร้างเข้ากันได้
- จัดการ Number Types
- จัดการ Nullability
- รักษาข้อมูล Metadata ของ Array
- ทำให้ผลลัพธ์ของ Schema มีรูปแบบที่แน่นอน

### 4. Schema Validation

ตรวจสอบ Schema หลังจากผ่านกระบวนการ Normalization ก่อนนำไปสร้าง Source Code

ความรับผิดชอบ:
- ตรวจสอบโครงสร้างและ Metadata
- ตรวจจับชนิดข้อมูลที่ไม่ถูกต้องหรือไม่รองรับ
- บังคับใช้ข้อจำกัดของชนิดข้อมูล
- จำกัดความลึกและความซับซ้อนของ Schema
- แจ้งเตือนหรือรายงานปัญหาพร้อมระบุตำแหน่งของ Field

### 5. Code Generator

แปลง Schema ที่ผ่านการตรวจสอบแล้วให้เป็น Source Code ของภาษาโปรแกรมมิ่งที่เลือก

ในช่วงเริ่มต้นจะพัฒนา Generator สำหรับภาษา Go ก่อน

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

*ตัวอย่างผลลัพธ์นี้ใช้เพื่ออธิบายแนวคิดเท่านั้น ผลลัพธ์จริงอาจแตกต่างตาม Generator Options และกฎการ Mapping ชนิดข้อมูล*

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

แยกหน้าที่ของ UI, Parser, Type Inference, Validation และ Code Generator ออกจากกันอย่างชัดเจน

### 2. Type Safety

ใช้ TypeScript เพื่อกำหนดรูปแบบข้อมูลและ Schema ให้ชัดเจน ลดข้อผิดพลาดที่อาจเกิดขึ้นระหว่าง Runtime

### 3. Extensibility

ออกแบบ Engine ให้สามารถเพิ่มภาษาโปรแกรมมิ่งใหม่ได้ โดยไม่ต้องแก้ไข Core Inference Logic

### 4. Testability

Core Engine แต่ละส่วนต้องสามารถทดสอบแยกจากกันได้ โดยไม่ต้องพึ่งพา React Components

### 5. Deterministic Output

เมื่อใช้ Input และ Configuration เดียวกัน ควรได้ Schema และ Source Code ที่มีผลลัพธ์เหมือนเดิมทุกครั้ง

## Roadmap

### Phase 1 — Core Engine
- [x] Project Architecture
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
- [ ] รองรับภาษาโปรแกรมมิ่งเพิ่มเติม
- [ ] Custom Naming Rules
- [ ] Import and Export Options

## Project Philosophy

Struct Convert ไม่ได้ถูกออกแบบมาให้เป็นเพียงเครื่องมือแปลง JSON เป็น Struct เท่านั้น แต่เป็น Schema Inference Engine ที่สามารถเข้าใจโครงสร้างข้อมูล จัดการกับความแตกต่างของข้อมูล และเป็นพื้นฐานสำหรับการสร้าง Strongly Typed Code ในภาษาโปรแกรมมิ่งต่าง ๆ

---

**Built with React and TypeScript.**