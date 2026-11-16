# Struct Convert

เครื่องมือสำหรับแปลง JSON ให้เป็น Go Struct โดยอัตโนมัติ ช่วยลดเวลาในการเขียน Struct ด้วยตัวเอง และทำให้การสร้าง Go Model จาก JSON ทำได้ง่ายและรวดเร็วยิ่งขึ้น

## ภาพรวมโปรเจกต์

**Struct Convert** เป็น Developer Tool ที่ช่วยแปลงข้อมูล JSON ให้กลายเป็น Go Struct โดยผู้ใช้สามารถวาง JSON ที่ต้องการแปลง จากนั้นระบบจะวิเคราะห์โครงสร้างข้อมูลและสร้าง Go Struct ให้โดยอัตโนมัติ

โปรเจกต์นี้พัฒนาด้วย React และ TypeScript โดยประมวลผลข้อมูลทั้งหมดภายใน Browser จึงไม่จำเป็นต้องมี Backend Server ในเวอร์ชันแรก

## คุณสมบัติหลัก

- **JSON to Go Struct** — แปลง JSON เป็น Go Struct โดยอัตโนมัติ
- **รองรับ JSON Object** — สามารถแปลง JSON Object ที่มีข้อมูลซ้อนกันได้
- **รองรับ JSON Array** — สามารถวิเคราะห์ Array และสร้าง Struct สำหรับข้อมูลภายใน Array ได้
- **Nested Struct** — รองรับ Object และ Array ที่ซ้อนกันหลายระดับ
- **Type Inference** — วิเคราะห์ชนิดข้อมูลจาก JSON และเลือก Go Type ที่เหมาะสม
- **JSON Tags** — สร้าง JSON Tags ให้กับ Struct โดยอัตโนมัติ
- **Copy Code** — คัดลอก Go Struct ที่สร้างขึ้นได้ทันที
- **Client-side Processing** — ประมวลผลภายใน Browser โดยไม่ต้องส่งข้อมูลไปยัง Backend

## คุณสมบัติที่วางแผนไว้

- รองรับ JSON ตัวอย่างหลายชุดเพื่อรวมและวิเคราะห์ Schema
- ปรับแต่งชื่อ Struct และ Field ได้
- ตั้งค่ารูปแบบ Pointer และ JSON Tags ได้
- รองรับการสร้าง Code สำหรับภาษาอื่น เช่น TypeScript
- บันทึกประวัติการแปลงข้อมูล

## Tech Stack

| Technology | Purpose |
|---|---|
| React | สร้าง User Interface |
| TypeScript | พัฒนาระบบด้วย Static Typing |
| Vite | Development Server และ Build Tool |
| Monaco Editor | Code Editor สำหรับ JSON และ Go |
| Vitest | Unit Testing |
| Oxlint | Code Linting |
| Prettier | Code Formatting |
| gofmt | จัดรูปแบบ Go Code ที่สร้างขึ้น |

> รายการข้างต้นเป็น Technology Stack ที่วางแผนใช้ในโปรเจกต์ โดยบางรายการอาจยังไม่ได้ติดตั้งหรือเชื่อมต่อในปัจจุบัน

## Project Structure

โปรเจกต์ใช้แนวทาง Feature-based Architecture ร่วมกับการแยกหน้าที่ของแต่ละส่วน เพื่อให้สามารถดูแลและขยายระบบได้ง่ายในอนาคต

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
│       │   │   └── infer-array.ts
│       │   │
│       │   ├── generators/
│       │   │   └── golang/
│       │   │       ├── go-generator.ts
│       │   │       ├── go-type-mapper.ts
│       │   │       ├── go-naming.ts
│       │   │       └── go-tags.ts
│       │   │
│       │   └── core/
│       │       ├── schema.ts
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

### หน้าที่ของแต่ละส่วน

| ส่วน | หน้าที่ |
|---|---|
| `components/` | UI Components ของ Converter |
| `hooks/` | จัดการ State และ Logic ที่เกี่ยวข้องกับ UI |
| `parser/` | ตรวจสอบและ Parse JSON |
| `inference/` | วิเคราะห์โครงสร้างและอนุมานชนิดข้อมูล |
| `generators/` | สร้าง Source Code ตามภาษาที่ต้องการ |
| `core/` | เก็บ Schema และ Error Definitions |
| `types/` | Type Definitions ที่ใช้ใน Feature |
| `constants/` | ค่าเริ่มต้นและ Configuration |
| `utils/` | Utility Functions ที่ใช้ร่วมกัน |

## Architecture

ระบบแบ่งการทำงานหลักออกเป็น 3 ขั้นตอน

```text
       JSON Input
            |
            v
    +---------------+
    |     Parser    |
    +---------------+
            |
            v
    +---------------+
    | Type Inference|
    |   & Schema    |
    +---------------+
            |
            v
    +---------------+
    | Go Generator  |
    +---------------+
            |
            v
       Go Struct
```

### 1. Parser

รับ JSON จากผู้ใช้และตรวจสอบความถูกต้องของข้อมูล ก่อนส่งต่อให้ระบบวิเคราะห์โครงสร้าง

### 2. Type Inference

วิเคราะห์โครงสร้าง JSON เพื่อสร้าง Schema กลาง (Intermediate Representation หรือ IR) โดยไม่ผูกติดกับภาษาโปรแกรมใดภาษาหนึ่ง

ตัวอย่างการวิเคราะห์ชนิดข้อมูล:

| JSON Type | Go Type |
|---|---|
| String | `string` |
| Integer | `int` |
| Decimal | `float64` |
| Boolean | `bool` |
| Object | `struct` |
| Array | `[]T` |
| Null | ขึ้นอยู่กับชนิดข้อมูลและการตั้งค่า |

การใช้ Schema กลางช่วยให้สามารถเพิ่ม Generator สำหรับภาษาอื่นได้ในอนาคต โดยไม่จำเป็นต้องเขียนระบบวิเคราะห์ JSON ใหม่

### 3. Go Generator

นำ Schema ที่ได้จาก Type Inference มาสร้าง Go Struct โดยจัดการเรื่องต่าง ๆ เช่น

- การแปลงชื่อ Field ให้เป็นรูปแบบ Go Naming Convention
- การสร้าง Nested Struct
- การ Mapping JSON Type เป็น Go Type
- การสร้าง JSON Tags
- การจัดการ Pointer และ Optional Fields ตาม Configuration

## Getting Started

### Prerequisites

สิ่งที่ต้องมีในเครื่องก่อนเริ่มต้นใช้งาน

- Node.js
- npm

### Installation

Clone Repository:

```bash
git clone <repository-url>
```

เข้าไปยัง Project Directory:

```bash
cd struct-convert
```

ติดตั้ง Dependencies:

```bash
npm install
```

### Development

เริ่มต้น Development Server:

```bash
npm run dev
```

จากนั้นเปิด URL ที่ Vite แสดงใน Terminal โดยปกติจะเป็น:

```text
http://localhost:5173
```

### Build

สำหรับ Build โปรเจกต์:

```bash
npm run build
```

ตรวจสอบ Build Preview:

```bash
npm run preview
```

## Usage

### ตัวอย่าง JSON Input

```json
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "age": 25,
  "is_active": true,
  "profile": {
    "address": "Bangkok",
    "phone": "0812345678"
  }
}
```

### ตัวอย่าง Go Struct Output

```go
type User struct {
    ID       int    `json:"id"`
    Name     string `json:"name"`
    Email    string `json:"email"`
    Age      int    `json:"age"`
    IsActive bool   `json:"is_active"`
    Profile  Profile `json:"profile"`
}

type Profile struct {
    Address string `json:"address"`
    Phone   string `json:"phone"`
}
```

### รองรับ JSON Array

ตัวอย่าง Input:

```json
[
  {
    "id": 1,
    "name": "John",
    "age": 25
  },
  {
    "id": 2,
    "name": "Jane",
    "email": "jane@example.com"
  }
]
```

ระบบจะวิเคราะห์ข้อมูลทุก Object ภายใน Array เพื่อสร้าง Struct ที่ครอบคลุม Field ที่พบทั้งหมด และสามารถสร้าง Go Slice สำหรับนำไปใช้งานได้

## Development Guidelines

### Separation of Concerns

แยกความรับผิดชอบของแต่ละส่วนให้ชัดเจน เช่น

- Parser ไม่ควรรับผิดชอบการสร้าง Go Code
- Inference Engine ไม่ควรผูกติดกับ Go Type
- Generator ไม่ควรต้อง Parse JSON ใหม่
- UI ไม่ควรมี Business Logic ของการแปลงข้อมูล

### Schema-based Design

ใช้ Schema กลางเป็นตัวเชื่อมระหว่างการวิเคราะห์ข้อมูลและการสร้าง Code เพื่อรองรับการเพิ่มภาษาใหม่ในอนาคต

### Type Safety

ใช้ TypeScript เพื่อกำหนด Type ให้กับข้อมูลและลดข้อผิดพลาดจากการทำงานของระบบ

## Testing

ใช้ Vitest สำหรับทดสอบ Logic ของระบบ โดยแยกการทดสอบตามส่วนการทำงาน

หัวข้อที่ควรทดสอบ:

- JSON Parsing และ Validation
- Primitive Type Inference
- Object และ Nested Object Inference
- Array และ Nested Array Inference
- Type Merging
- Optional และ Nullable Fields
- Go Naming Convention
- Go Type Mapping
- Go Struct Generation
- JSON Tag Generation

คำสั่งสำหรับรัน Test:

```bash
npm run test
```

รัน Test พร้อม Coverage:

```bash
npm run test -- --coverage
```

## Code Quality

ตรวจสอบ Code ด้วย Oxlint:

```bash
npx oxlint .
```

จัดรูปแบบ Code ด้วย Prettier:

```bash
npx prettier --write .
```

สำหรับ Go Code ที่สร้างขึ้น สามารถใช้ `gofmt` เพื่อจัดรูปแบบให้เป็นมาตรฐานของภาษา Go

## Roadmap

### Phase 1: Core Engine

- [x] Initialize React + TypeScript + Vite project
- [ ] Implement JSON Parser
- [ ] Implement Type Inference
- [ ] Implement Object และ Array Inference
- [ ] Implement Type Merging
- [ ] Create Schema Model

### Phase 2: Go Generator

- [ ] Implement Go Type Mapper
- [ ] Implement Go Naming Convention
- [ ] Generate Nested Struct
- [ ] Generate JSON Tags
- [ ] Support Pointer Options
- [ ] Support Optional Fields
- [ ] Format Generated Go Code

### Phase 3: User Interface

- [ ] Create JSON Editor
- [ ] Create Go Struct Viewer
- [ ] Implement Converter Options
- [ ] Implement Copy Code
- [ ] Implement Error Handling และ Validation
- [ ] Implement Responsive Layout

### Phase 4: Advanced Features

- [ ] Support Multiple JSON Samples
- [ ] Improve Schema Merging
- [ ] Custom Struct และ Field Naming
- [ ] Add TypeScript Generator
- [ ] Conversion History

## Contributing

ยินดีต้อนรับการเสนอแนะ การแจ้งปัญหา และการร่วมพัฒนาโปรเจกต์

หากพบ Bug หรือมี Feature ที่ต้องการเพิ่มเติม สามารถเปิด Issue เพื่อพูดคุยและเสนอแนวทางการปรับปรุงได้

## License

อยู่ระหว่างการพัฒนาและกำหนด License