# Aliaflow Single-User CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every text string and image on the Aliaflow public site (`work/aliaflow-nextjs`) editable through a single-user admin panel, with content stored in SQLite and no change to the public site's visual design.

**Architecture:** One Next.js 15 app serves the public site, a `/admin` panel built with hand-rolled shadcn-style primitives, and API routes for auth/content/media. Content lives in a `Section` table (one JSON blob per section key); a schema-driven generic form generator renders the whole admin UI from a single declarative field-schema file, so there is one editor implementation, not twelve.

**Tech Stack:** Next.js 15.5.2 (App Router, React 19, TypeScript strict), Prisma + SQLite, `jose` (session JWT), `bcryptjs` (password hashing), Tailwind CSS (scoped to `/admin` only, preflight disabled), `sonner` (toasts), `vitest` (unit tests for pure logic).

## Global Constraints

- Next.js version is 15.5.2 — dynamic route `params` (in both page components and route handlers) are `Promise`s and MUST be awaited: `const { key } = await params`.
- TypeScript `strict: true` is already on in `work/aliaflow-nextjs/tsconfig.json` — all new code must type-check under it.
- No path alias is configured (no `@/*` in tsconfig) — use relative imports everywhere, matching the existing codebase convention.
- The public site's CSS (`app/globals.css`, `app/figma-overrides.css`, `app/dafic.css`) must not change in appearance. Tailwind is added only for `/admin`, with `corePlugins.preflight` disabled, and its stylesheet is imported only from the admin layout — never from the root layout.
- Single admin user only: no signup flow, no roles. The user is created by the seed script from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars.
- SQLite database file lives at `work/aliaflow-nextjs/prisma/dev.db` (via `DATABASE_URL="file:./dev.db"`), not Postgres.
- All commands in this plan are run with `work/aliaflow-nextjs` as the working directory unless stated otherwise.
- Session cookie name is `aliaflow_session` — do not rename it once other tasks depend on it.
- Do not modify `work/aliaflow-cms` (the NestJS project) — it is left in place, unused.

---

### Task 1: Dependencies, Prisma schema, DB client

**Files:**
- Modify: `work/aliaflow-nextjs/package.json`
- Create: `work/aliaflow-nextjs/prisma/schema.prisma`
- Create: `work/aliaflow-nextjs/.env`
- Create: `work/aliaflow-nextjs/.env.example`
- Create: `work/aliaflow-nextjs/lib/db.ts`
- Modify: `work/aliaflow-nextjs/.gitignore` (create if absent)

**Interfaces:**
- Produces: `prisma` (singleton `PrismaClient`) exported from `lib/db.ts`, used by every later task that touches the DB.

- [ ] **Step 1: Install dependencies**

Run from `work/aliaflow-nextjs`:

```bash
npm install @prisma/client jose bcryptjs sonner dotenv
npm install -D prisma vitest tsx @types/bcryptjs "tailwindcss@^3.4.0" "postcss@^8.4.0" "autoprefixer@^10.4.0" class-variance-authority clsx tailwind-merge
```

Tailwind is pinned to the v3 line deliberately: v4 changes the config format (CSS-based
`@import`, no `tailwind.config.ts`, a different PostCSS plugin package) and would not
work with the `tailwind.config.ts` / `@tailwind base/components/utilities` setup in
Task 7.

- [ ] **Step 2: Write the Prisma schema**

Create `work/aliaflow-nextjs/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Section {
  key       String   @id
  data      String
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 3: Add env files**

Create `work/aliaflow-nextjs/.env`:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="dev-only-change-me-32-bytes-minimum"
ADMIN_EMAIL="admin@aliaflow.com"
ADMIN_PASSWORD="change-me-please"
```

Create `work/aliaflow-nextjs/.env.example`:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-string"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
```

- [ ] **Step 4: Ignore local DB and env files**

Append to `work/aliaflow-nextjs/.gitignore` (create the file with this content if it does not exist):

```
node_modules
.next
.env
prisma/dev.db
prisma/dev.db-journal
```

- [ ] **Step 5: Generate the Prisma client and create the database**

```bash
npx prisma generate
npx prisma db push
```

Expected: both commands exit 0; `prisma db push` reports `Your database is now in sync with your Prisma schema.` and creates `prisma/dev.db`.

- [ ] **Step 6: Write the DB client singleton**

Create `work/aliaflow-nextjs/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 7: Verify the client loads**

```bash
node -e "require('@prisma/client'); console.log('prisma client ok')"
```

Expected: prints `prisma client ok` with no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json prisma/schema.prisma .env.example .gitignore lib/db.ts
git commit -m "Add Prisma + SQLite setup for CMS content storage"
```

(`.env` itself is intentionally not committed — it is gitignored.)

---

### Task 2: Pure section-content validator (with unit tests)

**Files:**
- Create: `work/aliaflow-nextjs/lib/section-validation.ts`
- Test: `work/aliaflow-nextjs/lib/section-validation.test.ts`
- Create: `work/aliaflow-nextjs/vitest.config.ts`

**Interfaces:**
- Produces: `type FieldSchema`, `type SectionSchema`, `validateSectionData(fields: Record<string, FieldSchema>, data: unknown): string[]` (returns a list of human-readable issues; empty array means valid). Used by Task 3 (`lib/sections.schema.ts` for the type) and Task 4 (`lib/sections.ts` for validation).

- [ ] **Step 1: Write the failing tests**

Create `work/aliaflow-nextjs/lib/section-validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateSectionData, type FieldSchema } from "./section-validation";

describe("validateSectionData", () => {
  const fields: Record<string, FieldSchema> = {
    title: { type: "text", label: "Title" },
    body: { type: "textarea", label: "Body" },
    image: { type: "image", label: "Image" },
    items: {
      type: "list",
      label: "Items",
      itemLabel: "Item",
      fields: {
        label: { type: "text", label: "Label" },
      },
    },
  };

  it("accepts a fully valid payload", () => {
    const issues = validateSectionData(fields, {
      title: "Hello",
      body: "World",
      image: "/uploads/a.png",
      items: [{ label: "one" }, { label: "two" }],
    });
    expect(issues).toEqual([]);
  });

  it("rejects a non-object payload", () => {
    expect(validateSectionData(fields, null)).toEqual(["root: expected an object"]);
    expect(validateSectionData(fields, [])).toEqual(["root: expected an object"]);
  });

  it("reports a missing/non-string scalar field", () => {
    const issues = validateSectionData(fields, {
      title: 123,
      body: "World",
      image: "/uploads/a.png",
      items: [],
    });
    expect(issues).toEqual(["root.title: expected a string"]);
  });

  it("reports a non-array list field", () => {
    const issues = validateSectionData(fields, {
      title: "Hello",
      body: "World",
      image: "/uploads/a.png",
      items: "not a list",
    });
    expect(issues).toEqual(["root.items: expected an array"]);
  });

  it("reports issues inside list items with their index", () => {
    const issues = validateSectionData(fields, {
      title: "Hello",
      body: "World",
      image: "/uploads/a.png",
      items: [{ label: "ok" }, { label: 5 }],
    });
    expect(issues).toEqual(["root.items[1].label: expected a string"]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Create `work/aliaflow-nextjs/vitest.config.ts` first (needed for the run to work at all):

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

Add a script to `work/aliaflow-nextjs/package.json` `"scripts"`:

```json
"test": "vitest run"
```

Run: `npm test`
Expected: FAIL — `Cannot find module './section-validation'`.

- [ ] **Step 3: Implement the validator**

Create `work/aliaflow-nextjs/lib/section-validation.ts`:

```ts
export type FieldSchema =
  | { type: "text"; label: string }
  | { type: "textarea"; label: string }
  | { type: "image"; label: string }
  | {
      type: "list";
      label: string;
      itemLabel: string;
      fields: Record<string, FieldSchema>;
    };

export type SectionSchema = {
  label: string;
  fields: Record<string, FieldSchema>;
};

export function validateSectionData(
  fields: Record<string, FieldSchema>,
  data: unknown,
  path = "root",
): string[] {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return [`${path}: expected an object`];
  }
  const record = data as Record<string, unknown>;
  const issues: string[] = [];
  for (const [key, field] of Object.entries(fields)) {
    issues.push(...validateField(field, record[key], `${path}.${key}`));
  }
  return issues;
}

function validateField(field: FieldSchema, value: unknown, path: string): string[] {
  if (field.type === "text" || field.type === "textarea" || field.type === "image") {
    return typeof value === "string" ? [] : [`${path}: expected a string`];
  }
  if (!Array.isArray(value)) {
    return [`${path}: expected an array`];
  }
  return value.flatMap((item, index) =>
    validateSectionData(field.fields, item, `${path}[${index}]`),
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 5 tests passing in `lib/section-validation.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts lib/section-validation.ts lib/section-validation.test.ts
git commit -m "Add schema-driven section content validator with tests"
```

---

### Task 3: Section field-schema definitions for all 12 sections

**Files:**
- Create: `work/aliaflow-nextjs/lib/sections.schema.ts`
- Test: `work/aliaflow-nextjs/lib/sections.schema.test.ts`

**Interfaces:**
- Consumes: `FieldSchema`, `SectionSchema`, `validateSectionData` from `./section-validation` (Task 2).
- Produces: `sectionSchemas: Record<string, SectionSchema>` keyed by section key (`header`, `hero`, `outcomes`, `service-catalogue-nav`, `thrivable-business`, `business-leadership`, `technocratic-design`, `execution-management`, `why-choose-us`, `portfolio-people`, `testimonials-footer`, `footer`). Used by Task 5 (`lib/sections.ts`), Task 8 (API route), Task 9 (admin pages).

- [ ] **Step 1: Write the failing test**

Create `work/aliaflow-nextjs/lib/sections.schema.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateSectionData } from "./section-validation";
import { sectionSchemas } from "./sections.schema";

const EXPECTED_KEYS = [
  "header",
  "hero",
  "outcomes",
  "service-catalogue-nav",
  "thrivable-business",
  "business-leadership",
  "technocratic-design",
  "execution-management",
  "why-choose-us",
  "portfolio-people",
  "testimonials-footer",
  "footer",
];

describe("sectionSchemas", () => {
  it("declares exactly the 12 expected section keys", () => {
    expect(Object.keys(sectionSchemas).sort()).toEqual([...EXPECTED_KEYS].sort());
  });

  it("every schema has a non-empty label and at least one field", () => {
    for (const [key, schema] of Object.entries(sectionSchemas)) {
      expect(schema.label, `${key} label`).not.toEqual("");
      expect(Object.keys(schema.fields).length, `${key} fields`).toBeGreaterThan(0);
    }
  });

  it("an empty object always fails validation (every section has required fields)", () => {
    for (const [key, schema] of Object.entries(sectionSchemas)) {
      const issues = validateSectionData(schema.fields, {});
      expect(issues.length, `${key} should reject {}`).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './sections.schema'`.

- [ ] **Step 3: Implement the schema definitions**

Create `work/aliaflow-nextjs/lib/sections.schema.ts`:

```ts
import type { FieldSchema, SectionSchema } from "./section-validation";

function text(label: string): FieldSchema {
  return { type: "text", label };
}

function textarea(label: string): FieldSchema {
  return { type: "textarea", label };
}

function image(label: string): FieldSchema {
  return { type: "image", label };
}

function list(label: string, itemLabel: string, fields: Record<string, FieldSchema>): FieldSchema {
  return { type: "list", label, itemLabel, fields };
}

export const sectionSchemas: Record<string, SectionSchema> = {
  header: {
    label: "Header",
    fields: {
      wordmark: text("Wordmark"),
      links: list("Navigation links", "Link", {
        label: text("Label"),
      }),
    },
  },

  hero: {
    label: "Hero",
    fields: {
      eyebrow: text("Eyebrow"),
      heading: textarea("Heading (use a new line for a line break)"),
      image: image("Background image"),
    },
  },

  outcomes: {
    label: "Outcomes",
    fields: {
      intro_heading: textarea("Intro heading"),
      items: list("Outcomes", "Outcome", {
        label: text("Label (e.g. \"is Desirable\")"),
        emphasis: text("Emphasis word (e.g. \"DIFFERENT\")"),
        copy: textarea("Body copy"),
        stats: list("Stats", "Stat", { value: text("Value") }),
      }),
      manifesto_heading: textarea("Manifesto heading"),
      manifesto_words: textarea("Manifesto word stack"),
    },
  },

  "service-catalogue-nav": {
    label: "Service Catalogue Nav",
    fields: {
      heading: text("Heading"),
      tabs: list("Tabs", "Tab", {
        number: text("Number"),
        label: text("Label"),
      }),
    },
  },

  "thrivable-business": {
    label: "Thrivable Business",
    fields: {
      heading: text("Heading"),
      question_image: image("Question section image"),
      question: textarea("Question heading"),
      service_blocks: list("Service blocks", "Block", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
      }),
      futures: list("Future cards", "Future", {
        title: text("Card label"),
        heading: textarea("Heading"),
        tags: textarea("Tags"),
      }),
      loops: list("Business loop tiles", "Loop", {
        image: image("Image"),
        label: text("Label"),
        title: text("Title"),
      }),
      cultures: list("Culture tiles", "Culture", {
        image: image("Image"),
        label: text("Label"),
        title: text("Title"),
      }),
      magazine_heading: textarea("Magazine heading"),
      magazine_price: text("Magazine price"),
      magazine_image: image("Magazine image"),
      jam_heading: textarea("JAM heading"),
      jam_date: text("JAM date"),
      jam_body: textarea("JAM body"),
      jam_image: image("JAM image"),
    },
  },

  "business-leadership": {
    label: "Business Leadership",
    fields: {
      question: textarea("Question heading"),
      statements: list("Statements", "Statement", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        cards: list("Cards", "Card", {
          title: text("Title"),
          image: image("Image (leave blank for a plain numbered tile)"),
        }),
      }),
      holocratic_line: text("Holocratic line"),
      event_title: text("Event title"),
      event_image: image("Event image"),
    },
  },

  "technocratic-design": {
    label: "Technocratic Design",
    fields: {
      question: textarea("Question heading"),
      pillars: list("Pillars", "Pillar", { label: text("Label") }),
      statements: list("Statements", "Statement", {
        number: text("Number"),
        title: text("Title"),
        body: textarea("Body"),
        cards: list("Cards", "Card", {
          title: text("Title"),
          image: image("Image (leave blank for a plain numbered tile)"),
        }),
      }),
      event_title: text("Event title"),
      event_image: image("Event image"),
    },
  },

  "execution-management": {
    label: "Execution Management",
    fields: {
      heading: text("Heading"),
      orbit_labels: list("Orbit labels", "Label", { label: textarea("Label") }),
      emphasized_label: textarea("Emphasized (center) label"),
      body: textarea("Body"),
    },
  },

  "why-choose-us": {
    label: "Why Choose Us",
    fields: {
      eyebrow: text("Eyebrow"),
      heading: textarea("Heading"),
      points: list("Points", "Point", {
        label: text("Label"),
        body: textarea("Body"),
      }),
    },
  },

  "portfolio-people": {
    label: "Portfolio & People",
    fields: {
      timeline: list("Timeline", "Milestone", {
        year: text("Year"),
        label: text("Label"),
      }),
      people: list("People", "Person", {
        name: text("Name"),
        role: text("Role"),
        image: image("Photo"),
      }),
      toolkits: list("Toolkits", "Toolkit", {
        title: text("Title"),
        body: textarea("Body"),
      }),
    },
  },

  "testimonials-footer": {
    label: "Testimonials",
    fields: {
      trust_heading: text("Trust banner heading"),
      trust_subheading: text("Trust banner subheading"),
      partners: list("Partners", "Partner", { name: text("Name") }),
      testimonials: list("Testimonials", "Testimonial", {
        name: text("Name"),
        role: text("Role"),
        title: text("Quote title"),
        body: textarea("Quote body"),
      }),
      closing_heading: textarea("Closing heading"),
      closing_body: textarea("Closing body"),
    },
  },

  footer: {
    label: "Footer",
    fields: {
      eyebrow: text("Eyebrow"),
      heading_line1: text("Heading line 1"),
      heading_emphasis: text("Heading emphasis word"),
      email: text("Contact email"),
      description: textarea("Description"),
      social_links: list("Social links", "Link", {
        label: text("Label"),
        href: text("URL"),
      }),
      copyright: text("Copyright line"),
    },
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all `sections.schema.test.ts` and `section-validation.test.ts` tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/sections.schema.ts lib/sections.schema.test.ts
git commit -m "Define field schemas for all 12 CMS sections"
```

---

### Task 4: Section content service (get/update against Prisma)

**Files:**
- Create: `work/aliaflow-nextjs/lib/sections.ts`

**Interfaces:**
- Consumes: `prisma` from `./db` (Task 1), `sectionSchemas` + `validateSectionData` from `./sections.schema` / `./section-validation` (Tasks 2-3).
- Produces: `getSection(key: string): Promise<Record<string, unknown> | null>`, `updateSection(key: string, data: unknown): Promise<Record<string, unknown>>`, `class SectionValidationError extends Error { issues: string[] }`. Used by Task 8 (API routes) and Task 9 (admin section pages), Task 11/12 (public site data loading).

There is no automated test for this task: it is a thin wrapper around Prisma and the already-tested pure validator, and DB access is exercised end-to-end in Task 6 (seed) and verified manually with `curl` in Task 8.

- [ ] **Step 1: Implement the service**

Create `work/aliaflow-nextjs/lib/sections.ts`:

```ts
import { prisma } from "./db";
import { sectionSchemas } from "./sections.schema";
import { validateSectionData } from "./section-validation";

export class SectionValidationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    super(issues.join("; "));
    this.issues = issues;
  }
}

export async function getSection(key: string): Promise<Record<string, unknown> | null> {
  const row = await prisma.section.findUnique({ where: { key } });
  if (!row) return null;
  return JSON.parse(row.data) as Record<string, unknown>;
}

export async function updateSection(
  key: string,
  data: unknown,
): Promise<Record<string, unknown>> {
  const schema = sectionSchemas[key];
  if (!schema) {
    throw new SectionValidationError([`Unknown section "${key}"`]);
  }

  const issues = validateSectionData(schema.fields, data);
  if (issues.length > 0) {
    throw new SectionValidationError(issues);
  }

  const serialized = JSON.stringify(data);
  await prisma.section.upsert({
    where: { key },
    update: { data: serialized },
    create: { key, data: serialized },
  });

  return data as Record<string, unknown>;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/sections.ts
git commit -m "Add section content read/write service with schema validation"
```

---

### Task 5: Auth helpers (password hashing + session tokens, with unit tests)

**Files:**
- Create: `work/aliaflow-nextjs/lib/auth.ts`
- Test: `work/aliaflow-nextjs/lib/auth.test.ts`

**Interfaces:**
- Produces: `SESSION_COOKIE_NAME = "aliaflow_session"`, `hashPassword(plain: string): Promise<string>`, `verifyPassword(plain: string, hash: string): Promise<boolean>`, `createSessionToken(userId: string): Promise<string>`, `verifySessionToken(token: string): Promise<{ sub: string } | null>`. Used by Task 6 (seed), Task 7 (middleware), Task 8 (auth API routes).

- [ ] **Step 1: Write the failing tests**

Create `work/aliaflow-nextjs/lib/auth.test.ts`:

```ts
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-at-least-32-bytes-long";
});

describe("auth", () => {
  it("hashes and verifies a password", async () => {
    const { hashPassword, verifyPassword } = await import("./auth");
    const hash = await hashPassword("correct-horse");
    expect(hash).not.toEqual("correct-horse");
    expect(await verifyPassword("correct-horse", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("creates a session token that verifies back to the same user id", async () => {
    const { createSessionToken, verifySessionToken } = await import("./auth");
    const token = await createSessionToken("user-123");
    const session = await verifySessionToken(token);
    expect(session).toEqual({ sub: "user-123" });
  });

  it("rejects a garbage token", async () => {
    const { verifySessionToken } = await import("./auth");
    expect(await verifySessionToken("not-a-real-token")).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module './auth'`.

- [ ] **Step 3: Implement auth helpers**

Create `work/aliaflow-nextjs/lib/auth.ts`:

```ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE_NAME = "aliaflow_session";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name}`);
  return value;
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(requireEnv("SESSION_SECRET"));
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all `auth.test.ts` tests green, plus the earlier suites still passing.

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts lib/auth.test.ts
git commit -m "Add password hashing and session token helpers with tests"
```

---

### Task 6: Seed script (admin user + all 12 sections' real content)

**Files:**
- Create: `work/aliaflow-nextjs/prisma/seed.ts`
- Modify: `work/aliaflow-nextjs/package.json` (add `"prisma": {"seed": "tsx prisma/seed.ts"}` and a `"seed"` script)

**Interfaces:**
- Consumes: `prisma` (Task 1), `hashPassword` (Task 5).
- Produces: a populated `dev.db` that Task 8 onward can read/write against and Task 11/12 can render from.

- [ ] **Step 1: Add the seed config and script to package.json**

In `work/aliaflow-nextjs/package.json`, add a top-level `"prisma"` key and a `"seed"` entry under `"scripts"`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "seed": "tsx prisma/seed.ts"
},
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 2: Write the seed script**

Create `work/aliaflow-nextjs/prisma/seed.ts` with the exact current site copy. The
`dotenv/config` import must come first — `tsx` does not load `.env` files on its own,
and this script depends on `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`:

```ts
import "dotenv/config";
import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth";

const sections: Record<string, Record<string, unknown>> = {
  header: {
    wordmark: "ALIAFLOW",
    links: [
      { label: "Home" },
      { label: "Products" },
      { label: "Packages" },
      { label: "Projects" },
      { label: "About us" },
      { label: "Contact us" },
    ],
  },

  hero: {
    eyebrow: "A L I A F L O W",
    heading: "YOUR TRUSTED\nLEADERSHIP PARTNER",
    image: "/assets/boardroom.png",
  },

  outcomes: {
    intro_heading: "YOUR BUSINESS\nIS...",
    items: [
      {
        label: "is Desirable",
        emphasis: "DIFFERENT",
        copy: "We create a truly differentiated business for you, built around the new and emerging needs and desires in your target market. It will not only be desirable and wanted by your customers, but also socially impactful and will create a lasting change in their work or life.",
        stats: [{ value: "# 4 Senses" }, { value: "# 3 Loops" }],
      },
      {
        label: "is Feasible",
        emphasis: "COMPETITIVE",
        copy: "The competitive advantage we create for you is based on a mixture of your organization’s capabilities and the future of emerging technologies, which makes it a unique and hard-to-copy advantage. At the same time, this competitive advantage will be at several silos and levels of your organization. Different types of innovation would eventually make it hard for your competitors to imitate your business structure.",
        stats: [{ value: "# 7 Risks" }, { value: "# 6 Roles" }, { value: "# 5 Games" }],
      },
      {
        label: "is Viable",
        emphasis: "SCALABLE",
        copy: "At this stage, we design a sustainable revenue model for your business that ensures long-term growth and keeps the organization moving steadily toward its goals. This model is built to support consistent progress, not just short-term gains. We also plan growth in a controlled and strategic way at every phase, ensuring that each step strengthens the business and prepares it for the next version of your business model.",
        stats: [{ value: "# 8 Changes" }, { value: "# 9 Tests" }],
      },
    ],
    manifesto_heading: "YOUR THRIVABLE\nBUSINESS IS",
    manifesto_words: "DIFFERENT\nCOMPETITIVE\nSCALABLE",
  },

  "service-catalogue-nav": {
    heading: "OUR SERVICE CATALOGUE",
    tabs: [
      { number: "1", label: "Thrivable Business" },
      { number: "2", label: "Business Leadership" },
      { number: "3", label: "Technocratic Design" },
      { number: "4", label: "Execution Management" },
    ],
  },

  "thrivable-business": {
    heading: "THRIVABLE BUSINESS",
    question_image: "/assets/metro-paths.png",
    question: "WHERE TO PLAY?\nHOW TO WIN?",
    service_blocks: [
      {
        number: "1",
        title: "Future of X Book",
        body: "Many companies lack the time, resources, and expertise required to continuously monitor the future of their industry, emerging technologies and new business models suitable for growth. At AliaFlow, by analyzing weak signals and emerging trends, we produce fully customized, periodic reports on future of industries in a technocratic world where new market and technologies emerge and disrupt the old model of doing business.",
      },
      {
        number: "2",
        title: "Critical Business Loop",
        body: "Based on the desired future, we consider the most value creating loops, aligned with your current capabilities and portfolio, into a practical business model with its most critical services. This critical business model provides a starting framework for developing a short-term and long-term strategies, helping leaders and decision makers align their planning and decisions around a shared goal.",
      },
      {
        number: "3",
        title: "Brand Culture & XP",
        body: "We shape the designed business model, we build a Brand City — a conceptual collaborative inner space that brings your brand's future to life in all its dimensions. From brand identity and culture, to the daily behaviors, and communication systems that make it real. The right open systems and ways of working will remove some of its stakeholders.",
      },
    ],
    futures: [
      {
        title: "Future of BANKING",
        heading: "Future of Banking in\na Technocratic world",
        tags: "#Digital Banking #FinTech Innovation\n#Automated & AI",
      },
      {
        title: "Future of GOVERNANCE",
        heading: "Future of Governance in\na Technocratic World",
        tags: "#Digital Governance #Smart Policy Systems\n#Futuristic Administration",
      },
      {
        title: "Future of EDUCATION",
        heading: "Future of Education in\na Technocratic World",
        tags: "#EdTech #Digital Learning\n#Future Classrooms",
      },
    ],
    loops: [
      { image: "/assets/aliasys-loop.png", label: "ICT Infrastructure", title: "Aliasys Business Loop" },
      { image: "/assets/aliapay-loop.png", label: "Banking and Fintech", title: "Aliapay Business Loop" },
      { image: "/assets/alialab-loop.png", label: "Education", title: "AliaLab Business Loop" },
    ],
    cultures: [
      { image: "/assets/workshop.png", label: "ICT Infrastructure", title: "Technocratic Culture" },
      { image: "/assets/design-event.png", label: "Innovation & Design", title: "Design Thinking Culture" },
      { image: "/assets/meeting-halftone.png", label: "Leadership & Management", title: "Collaborative Agile Culture" },
    ],
    magazine_heading: "THE FUTURE OF BANKING\nIN A TECHNOCRATIC WORLD\nMAGAZINE",
    magazine_price: "$900",
    magazine_image: "/assets/magazine.png",
    jam_heading: "Banking\nThrivability JAM",
    jam_date: "Mon, Oct 13, 2025 - Oct 17, 2025",
    jam_body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.",
    jam_image: "/assets/banking-event.png",
  },

  "business-leadership": {
    question: "WHAT TO PLAY?\nHOW TO LEAD?",
    statements: [
      {
        number: "4",
        title: "Business Game",
        body: "Through our proprietary Business Loop Game methodology, we help your organization move beyond a reactive mode and become a driver of change—where every decision contributes to creating a new game, rather than merely continuing the existing one.",
        cards: [
          { title: "Business Game 1", image: "/assets/alialab-loop.png" },
          { title: "Business Game 2", image: "/assets/aliapay-loop.png" },
          { title: "Business Game 3", image: "/assets/aliasys-loop.png" },
        ],
      },
      {
        number: "5",
        title: "Strategic Roles",
        body: "Implementing Brand City is not merely a creative project; it is an organizational transformation that requires leadership, role definition, and clear strategies to guide the future.",
        cards: [
          { title: "Strategic Role 1", image: "/assets/cyborg.png" },
          { title: "Strategic Role 2", image: "/assets/cyborg.png" },
          { title: "Strategic Role 3", image: "/assets/cyborg.png" },
        ],
      },
      {
        number: "6",
        title: "Leadership Model",
        body: "The strategic roles designed for your Brand City are entirely unique; they are a direct reflection of your brand's DNA and the future architecture of your business.",
        cards: [
          { title: "Leadership model 1", image: "" },
          { title: "Leadership model 2", image: "" },
          { title: "Leadership model 3", image: "" },
        ],
      },
    ],
    holocratic_line: "Mentoring, Leading, Training, Coaching, Managing",
    event_title: "Future Leadership JAM",
    event_image: "/assets/leadership-team.png",
  },

  "technocratic-design": {
    question: "WHEN TO DESIGN?\nHOW TO CHANGE?",
    pillars: [{ label: "Business Telling" }, { label: "Business Living" }, { label: "Business Playing" }],
    statements: [
      {
        number: "7",
        title: "Risk Setting",
        body: "Many businesses work on the wrong problems, wasting time and resources. We help your organization become part of the minority that identifies the right problem and solves it the right way.",
        cards: [
          { title: "Risk Setting 1", image: "/assets/people-feedback.png" },
          { title: "Risk Setting 2", image: "/assets/people-care.png" },
          { title: "Risk Setting 3", image: "/assets/workshop.png" },
        ],
      },
      {
        number: "8",
        title: "Change Solving",
        body: "Based on the real needs and challenges identified in the previous stages, our team researches, analyzes, and designs solutions that are fully aligned with your organization's DNA.",
        cards: [
          { title: "Change Solving 1", image: "" },
          { title: "Change Solving 2", image: "" },
          { title: "Change Solving 3", image: "" },
        ],
      },
      {
        number: "9",
        title: "Performance Testing",
        body: "The implementation of solutions is carried out in close collaboration with the organization’s units and experts through a fully participatory process.",
        cards: [
          { title: "Performance Testing 1", image: "" },
          { title: "Performance Testing 2", image: "" },
          { title: "Performance Testing 3", image: "" },
        ],
      },
    ],
    event_title: "Technocratic Design For Leadership JAM",
    event_image: "/assets/design-event.png",
  },

  "execution-management": {
    heading: "EXECUTION MANAGEMENT",
    orbit_labels: [
      { label: "ADORE\nREBRANDING" },
      { label: "DOGHAZAL\nEXPERIENCE" },
      { label: "FOMENTO\nBRANDING" },
      { label: "ARVA\nCAMPAIGN" },
    ],
    emphasized_label: "ALIASYS\nEXHIBITION",
    body: "By leveraging advanced information and communication technologies, we support businesses in creating a more optimized, efficient, and successful version of themselves.",
  },

  "why-choose-us": {
    eyebrow: "Why choose us?",
    heading: "Enabling Business\nThrivability through\nTechnocratic\nInnovation",
    points: [
      {
        label: "Different",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
      },
      {
        label: "Competitive",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
      },
      {
        label: "Scalable",
        body: "Business Continuity refers to an organization’s ability to maintain essential functions during and after a disaster, disruption, or unexpected event.",
      },
    ],
  },

  "portfolio-people": {
    timeline: [
      { year: "1389", label: "Timeline Machine" },
      { year: "1390", label: "Time Machine" },
      { year: "1395", label: "Timeline Machine" },
    ],
    people: [
      { name: "Vahid Daem", role: "Business Manager", image: "/assets/daem.png" },
      { name: "Nasim Tavakkoli", role: "Automation & AI Specialist", image: "/assets/tavakoli.png" },
      { name: "Saman Ehteshamzade", role: "Marketing Manager", image: "/assets/ehteshamzadeh.png" },
      { name: "Narges Mohit", role: "Space Designer", image: "/assets/mohit.png" },
    ],
    toolkits: [
      { title: "Toolkit 1", body: "Lorem ipsum dolot sit amet" },
      { title: "Toolkit 2", body: "Lorem ipsum dolot sit amet" },
      { title: "Toolkit 3", body: "Lorem ipsum dolot sit amet" },
      { title: "Toolkit 4", body: "Lorem ipsum dolot sit amet" },
    ],
  },

  "testimonials-footer": {
    trust_heading: "WHY TRUST US",
    trust_subheading: "R E A S O N   T O   B E L I E V E",
    partners: [
      { name: "Amin Advisor" },
      { name: "Atolie" },
      { name: "Tehran University" },
      { name: "Raad Architect" },
      { name: "Lorem Ipsum" },
      { name: "Lorem Ipsum" },
      { name: "Lorem Ipsum" },
      { name: "Lorem Ipsum" },
    ],
    testimonials: [
      {
        name: "Mr Ansari",
        role: "Cisco Manager",
        title: "Supporting after Sales",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit",
      },
      {
        name: "Mr Bahadori",
        role: "Cisco Manager",
        title: "Supporting after Sales",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit",
      },
    ],
    closing_heading: "WHAT\nIF...",
    closing_body: "You Could Change Your\nSuccessful Business to A\nThrivable Business",
  },

  footer: {
    eyebrow: "LET’S TALK",
    heading_line1: "Make your business",
    heading_emphasis: "thrive.",
    email: "hello@aliaflow.com",
    description: "Leadership partner for desirable, competitive and scalable businesses.",
    social_links: [
      { label: "LinkedIn", href: "#home" },
      { label: "Instagram", href: "#home" },
    ],
    copyright: "© 2025 Aliaflow. All rights reserved.",
  },
};

async function main() {
  for (const [key, data] of Object.entries(sections)) {
    await prisma.section.upsert({
      where: { key },
      update: { data: JSON.stringify(data) },
      create: { key, data: JSON.stringify(data) },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the admin user");
  }

  const passwordHash = await hashPassword(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  console.log(`Seeded ${Object.keys(sections).length} sections and admin user ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 3: Run the seed script**

```bash
npm run seed
```

Expected: prints `Seeded 12 sections and admin user admin@aliaflow.com` with no errors.

- [ ] **Step 4: Verify the data landed**

```bash
npx prisma studio --port 5556 &
sleep 2
curl -s "http://localhost:5556" > /dev/null && echo "studio reachable"
kill %1
```

If `prisma studio` is inconvenient in this environment, instead verify directly:

```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.section.count().then((n) => { console.log('section rows:', n); return p.user.count(); })
  .then((n) => { console.log('user rows:', n); return p.\$disconnect(); });
"
```

Expected: `section rows: 12` and `user rows: 1`.

- [ ] **Step 5: Commit**

```bash
git add package.json prisma/seed.ts
git commit -m "Add seed script populating admin user and all section content"
```

---

### Task 7: Tailwind CSS scoped to /admin + hand-rolled shadcn primitives

**Files:**
- Create: `work/aliaflow-nextjs/tailwind.config.ts`
- Create: `work/aliaflow-nextjs/postcss.config.mjs`
- Create: `work/aliaflow-nextjs/app/admin/admin.css`
- Create: `work/aliaflow-nextjs/lib/utils.ts`
- Create: `work/aliaflow-nextjs/components/ui/button.tsx`
- Create: `work/aliaflow-nextjs/components/ui/input.tsx`
- Create: `work/aliaflow-nextjs/components/ui/textarea.tsx`
- Create: `work/aliaflow-nextjs/components/ui/label.tsx`
- Create: `work/aliaflow-nextjs/components/ui/card.tsx`

**Interfaces:**
- Produces: `cn(...)` from `lib/utils.ts`; `Button`, `Input`, `Textarea`, `Label`, `Card`/`CardHeader`/`CardTitle`/`CardContent` components. Used by every admin UI task (Task 9, Task 10).

This task has no automated test — it is styling/primitive scaffolding, verified visually once the login page (Task 9) exists. Type-checking is the safety net here.

- [ ] **Step 1: Tailwind config, scoped and non-invasive**

Create `work/aliaflow-nextjs/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/admin/**/*.{ts,tsx}",
    "./components/admin/**/*.{ts,tsx}",
    "./components/ui/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

`preflight: false` is critical: it stops Tailwind from injecting its base CSS reset, which would otherwise change the public site's typography/box-sizing defaults.

- [ ] **Step 2: PostCSS config**

Create `work/aliaflow-nextjs/postcss.config.mjs`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Admin-only Tailwind stylesheet**

Create `work/aliaflow-nextjs/app/admin/admin.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

This file is imported only from `app/admin/(dashboard)/layout.tsx` and `app/admin/login/page.tsx` in Task 9 — never from `app/layout.tsx` — so the public site never loads Tailwind's output.

- [ ] **Step 4: `cn` class-merging helper**

Create `work/aliaflow-nextjs/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Button primitive**

Create `work/aliaflow-nextjs/components/ui/button.tsx`:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        outline: "border border-slate-300 bg-white hover:bg-slate-50",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        ghost: "hover:bg-slate-100",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
```

- [ ] **Step 6: Input, Textarea, Label, Card primitives**

Create `work/aliaflow-nextjs/components/ui/input.tsx`:

```tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
```

Create `work/aliaflow-nextjs/components/ui/textarea.tsx`:

```tsx
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
```

Create `work/aliaflow-nextjs/components/ui/label.tsx`:

```tsx
import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-sm font-medium text-slate-700", className)} {...props} />
  ),
);
Label.displayName = "Label";
```

Create `work/aliaflow-nextjs/components/ui/card.tsx`:

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold leading-none", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add tailwind.config.ts postcss.config.mjs app/admin/admin.css lib/utils.ts components/ui
git commit -m "Add Tailwind scoped to /admin and hand-rolled shadcn-style primitives"
```

---

### Task 8: API routes (auth, sections, media) + auth middleware

**Files:**
- Create: `work/aliaflow-nextjs/app/api/auth/login/route.ts`
- Create: `work/aliaflow-nextjs/app/api/auth/logout/route.ts`
- Create: `work/aliaflow-nextjs/app/api/sections/[key]/route.ts`
- Create: `work/aliaflow-nextjs/app/api/media/route.ts`
- Create: `work/aliaflow-nextjs/middleware.ts`

**Interfaces:**
- Consumes: `prisma` (Task 1), `getSection`/`updateSection`/`SectionValidationError` (Task 4), `sectionSchemas` (Task 3), `hashPassword`/`verifyPassword`/`createSessionToken`/`verifySessionToken`/`SESSION_COOKIE_NAME` (Task 5).
- Produces: the HTTP surface Task 9 (admin UI) and Task 11/12 (public site, GET only) call.

No automated tests for this task (route handlers need a running server); verified with `curl` against `next dev` in Steps 6-9 with exact expected output.

- [ ] **Step 1: Login route**

Create `work/aliaflow-nextjs/app/api/auth/login/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
```

- [ ] **Step 2: Logout route**

Create `work/aliaflow-nextjs/app/api/auth/logout/route.ts`:

```ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "../../../../lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
```

- [ ] **Step 3: Sections content route**

Create `work/aliaflow-nextjs/app/api/sections/[key]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSection, updateSection, SectionValidationError } from "../../../../lib/sections";
import { sectionSchemas } from "../../../../lib/sections.schema";

type RouteContext = { params: Promise<{ key: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { key } = await params;
  if (!sectionSchemas[key]) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }
  const data = await getSection(key);
  if (!data) {
    return NextResponse.json({ error: "Section not seeded" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { key } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const data = await updateSection(key, body);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof SectionValidationError) {
      return NextResponse.json({ error: error.message, issues: error.issues }, { status: 400 });
    }
    throw error;
  }
}
```

- [ ] **Step 4: Media upload route**

Create `work/aliaflow-nextjs/app/api/media/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
  }

  const extension = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const filename = `${randomUUID()}${extension}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ path: `/uploads/${filename}` });
}
```

- [ ] **Step 5: Auth middleware protecting /admin and mutating API routes**

Create `work/aliaflow-nextjs/middleware.ts` (at the project root, alongside `app/`):

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "./lib/auth";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.has(pathname);
  const isProtectedApi =
    (pathname.startsWith("/api/sections/") && request.method !== "GET") ||
    pathname.startsWith("/api/media");

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/sections/:path*", "/api/media/:path*"],
};
```

- [ ] **Step 6: Start the dev server for manual verification**

```bash
npm run dev &
sleep 3
```

- [ ] **Step 7: Verify public GET works, protected PATCH/media are rejected without a session**

```bash
curl -s http://localhost:3000/api/sections/hero
```

Expected: `{"data":{"eyebrow":"A L I A F L O W","heading":"YOUR TRUSTED\nLEADERSHIP PARTNER","image":"/assets/boardroom.png"}}`

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X PATCH http://localhost:3000/api/sections/hero -H 'Content-Type: application/json' -d '{}'
```

Expected: `401`

- [ ] **Step 8: Verify login issues a session cookie and PATCH then works**

```bash
curl -s -c /tmp/aliaflow-cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aliaflow.com","password":"change-me-please"}'
```

Expected: `{"ok":true}` and `/tmp/aliaflow-cookies.txt` now contains an `aliaflow_session` cookie.

```bash
curl -s -b /tmp/aliaflow-cookies.txt -X PATCH http://localhost:3000/api/sections/hero \
  -H 'Content-Type: application/json' \
  -d '{"eyebrow":"A L I A F L O W","heading":"YOUR TRUSTED\nLEADERSHIP PARTNER","image":"/assets/boardroom.png"}'
```

Expected: `{"data":{"eyebrow":"A L I A F L O W", ...}}` echoing the same object back, HTTP 200.

- [ ] **Step 9: Stop the dev server**

```bash
kill %1
```

- [ ] **Step 10: Commit**

```bash
git add app/api middleware.ts
git commit -m "Add auth, sections, and media API routes with session middleware"
```

---

### Task 9: Admin shell — login page, protected layout/sidebar, generic dynamic form

**Files:**
- Create: `work/aliaflow-nextjs/app/admin/login/page.tsx`
- Create: `work/aliaflow-nextjs/app/admin/(dashboard)/layout.tsx`
- Create: `work/aliaflow-nextjs/app/admin/(dashboard)/page.tsx`
- Create: `work/aliaflow-nextjs/app/admin/(dashboard)/sections/[key]/page.tsx`
- Create: `work/aliaflow-nextjs/components/admin/LogoutButton.tsx`
- Create: `work/aliaflow-nextjs/components/admin/DynamicSectionForm.tsx`

**Interfaces:**
- Consumes: `sectionSchemas` (Task 3), `getSection` (Task 4), `Button`/`Input`/`Textarea`/`Label`/`Card*` (Task 7), `/api/auth/login`, `/api/auth/logout`, `/api/sections/[key]`, `/api/media` (Task 8).
- Produces: the full admin editing experience. No later task depends on new exports beyond routing.

No automated test for this task — it is UI wiring, verified manually in the browser in Step 6.

- [ ] **Step 1: Login page**

Create `work/aliaflow-nextjs/app/admin/login/page.tsx`:

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Login failed");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Aliaflow CMS</h1>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Logout button (client component)**

Create `work/aliaflow-nextjs/components/admin/LogoutButton.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className="mt-4 w-full justify-start" onClick={handleLogout}>
      Log out
    </Button>
  );
}
```

- [ ] **Step 3: Protected dashboard layout with sidebar**

Create `work/aliaflow-nextjs/app/admin/(dashboard)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { sectionSchemas } from "../../../lib/sections.schema";
import { LogoutButton } from "../../../components/admin/LogoutButton";
import "../admin.css";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
        <p className="mb-4 text-sm font-semibold text-slate-500">Aliaflow CMS</p>
        <nav className="space-y-1">
          {Object.entries(sectionSchemas).map(([key, schema]) => (
            <Link
              key={key}
              href={`/admin/sections/${key}`}
              className="block rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              {schema.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Dashboard root redirect + generic section editor page**

Create `work/aliaflow-nextjs/app/admin/(dashboard)/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { sectionSchemas } from "../../../lib/sections.schema";

export default function AdminHomePage() {
  const [firstKey] = Object.keys(sectionSchemas);
  redirect(`/admin/sections/${firstKey}`);
}
```

Create `work/aliaflow-nextjs/app/admin/(dashboard)/sections/[key]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getSection } from "../../../../../lib/sections";
import { sectionSchemas } from "../../../../../lib/sections.schema";
import { DynamicSectionForm } from "../../../../../components/admin/DynamicSectionForm";

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const schema = sectionSchemas[key];
  if (!schema) notFound();

  const data = (await getSection(key)) ?? {};

  return <DynamicSectionForm sectionKey={key} schema={schema} initialData={data} />;
}
```

- [ ] **Step 5: The generic dynamic form (the whole admin editing engine)**

Create `work/aliaflow-nextjs/components/admin/DynamicSectionForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { FieldSchema, SectionSchema } from "../../lib/section-validation";

type SectionData = Record<string, unknown>;

function emptyValueFor(field: FieldSchema): unknown {
  return field.type === "list" ? [] : "";
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/media", { method: "POST", body: formData });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.path);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-32 w-auto rounded border border-slate-200 object-cover" />
      ) : null}
      <Input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  if (field.type === "text") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Input value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label>{field.label}</Label>
        <Textarea rows={4} value={(value as string) ?? ""} onChange={(event) => onChange(event.target.value)} />
      </div>
    );
  }

  if (field.type === "image") {
    return <ImageField label={field.label} value={(value as string) ?? ""} onChange={onChange} />;
  }

  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

  function updateItem(index: number, key: string, next: unknown) {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: next } : item)));
  }

  function addItem() {
    if (field.type !== "list") return;
    const blank: Record<string, unknown> = {};
    for (const [key, subField] of Object.entries(field.fields)) blank[key] = emptyValueFor(subField);
    onChange([...items, blank]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  if (field.type !== "list") return null;

  return (
    <div className="space-y-3">
      <Label>{field.label}</Label>
      {items.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">
              {field.itemLabel} {index + 1}
            </CardTitle>
            <div className="flex gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, -1)}>
                Up
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => moveItem(index, 1)}>
                Down
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                Remove
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(field.fields).map(([key, subField]) => (
              <FieldEditor
                key={key}
                field={subField}
                value={item[key]}
                onChange={(next) => updateItem(index, key, next)}
              />
            ))}
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="secondary" onClick={addItem}>
        Add {field.itemLabel}
      </Button>
    </div>
  );
}

export function DynamicSectionForm({
  sectionKey,
  schema,
  initialData,
}: {
  sectionKey: string;
  schema: SectionSchema;
  initialData: SectionData;
}) {
  const [data, setData] = useState<SectionData>(initialData);
  const [saving, setSaving] = useState(false);

  function updateField(key: string, next: unknown) {
    setData((prev) => ({ ...prev, [key]: next }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/sections/${sectionKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Save failed");
      toast.success("Saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">{schema.label}</h1>
      {Object.entries(schema.fields).map(([key, field]) => (
        <FieldEditor key={key} field={field} value={data[key]} onChange={(next) => updateField(key, next)} />
      ))}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 6: Add the toast provider once, and manually verify in the browser**

Add a `Toaster` to the dashboard layout — modify `work/aliaflow-nextjs/app/admin/(dashboard)/layout.tsx` to import and render it:

```tsx
import { Toaster } from "sonner";
```

and add `<Toaster />` as the last child inside the returned `<div className="flex min-h-screen bg-slate-50">`, after `</aside>` and the `<main>` block (i.e. as a sibling, right before the closing `</div>`).

Then run:

```bash
npm run dev &
sleep 3
```

Open `http://localhost:3000/admin` in a browser: it should redirect to `/admin/login`. Log in with `admin@aliaflow.com` / `change-me-please`. Confirm:
- You land on `/admin/sections/header` with the sidebar showing all 12 section labels.
- Editing the "Wordmark" field and clicking "Save changes" shows a success toast.
- Reloading the page shows the edited value persisted.
- Clicking "Log out" redirects to `/admin/login`, and visiting `/admin` again redirects back to login.

```bash
kill %1
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add app/admin components/admin
git commit -m "Add admin login, protected dashboard shell, and generic dynamic section form"
```

---

### Task 10: Wire the public site's simple sections to CMS content

**Files:**
- Modify: `work/aliaflow-nextjs/components/Header.tsx`
- Modify: `work/aliaflow-nextjs/components/Hero.tsx`
- Modify: `work/aliaflow-nextjs/components/Footer.tsx`
- Modify: `work/aliaflow-nextjs/components/OutcomePanel.tsx`
- Modify: `work/aliaflow-nextjs/components/OutcomeStack.tsx`
- Modify: `work/aliaflow-nextjs/components/FigmaSections.tsx` (only `ServiceCatalogueNav`, plus keep the rest of the file unchanged for now — Task 11 rewrites the rest)

**Interfaces:**
- Consumes: nothing new (plain props).
- Produces: prop-driven versions of these components, consumed by `app/page.tsx` in Task 12.

No automated test — verified visually together with Task 12 in Task 12's Step 6 (the whole page must render before there is anything meaningful to look at, since `app/page.tsx` imports every section).

- [ ] **Step 1: Header takes `wordmark` and `links` as props**

Replace the contents of `work/aliaflow-nextjs/components/Header.tsx`:

```tsx
"use client";

import { useState } from "react";

export type HeaderData = {
  wordmark: string;
  links: { label: string }[];
};

export function Header({ wordmark, links }: HeaderData) {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label={`${wordmark} home`}>{wordmark}</a>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="site-nav">Menu</button>
      <nav id="site-nav" className={open ? "nav-list open" : "nav-list"} aria-label="Primary navigation">
        {links.map((link) => (
          <a key={link.label} href={`#${link.label.toLowerCase().replaceAll(" ", "-")}`}>{link.label}</a>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Hero takes `eyebrow`, `heading`, `image` as props**

Replace the contents of `work/aliaflow-nextjs/components/Hero.tsx`:

```tsx
import Image from "next/image";
import { Fragment } from "react";

export type HeroData = {
  eyebrow: string;
  heading: string;
  image: string;
};

export function Hero({ eyebrow, heading, image }: HeroData) {
  const headingLines = heading.split("\n");
  return (
    <section id="home" className="hero section-dark">
      <div className="hero-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>
          {headingLines.map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </h1>
      </div>
      <div className="hero-art">
        <Image src={image} alt="Leadership team around a strategic table" fill priority sizes="(max-width: 780px) 100vw, 58vw" />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Footer takes its fields as props**

Replace the contents of `work/aliaflow-nextjs/components/Footer.tsx`:

```tsx
export type FooterData = {
  eyebrow: string;
  heading_line1: string;
  heading_emphasis: string;
  email: string;
  description: string;
  social_links: { label: string; href: string }[];
  copyright: string;
};

export function Footer({ eyebrow, heading_line1, heading_emphasis, email, description, social_links, copyright }: FooterData) {
  return (
    <footer id="contact-us" className="footer section-dark">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{heading_line1}<br /><em>{heading_emphasis}</em></h2>
        <a href={`mailto:${email}`} className="cta">{email} <span>&#8599;</span></a>
      </div>
      <div className="footer-meta">
        <a className="wordmark" href="#home">ALIAFLOW</a>
        <p>{description}</p>
        <div>
          {social_links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}
        </div>
        <small>{copyright}</small>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: OutcomePanel + OutcomeStack take the `outcomes` shape from the schema**

Replace the contents of `work/aliaflow-nextjs/components/OutcomePanel.tsx`:

```tsx
export type Outcome = {
  label: string;
  emphasis: string;
  copy: string;
  stats: { value: string }[];
};

export function OutcomePanel({ outcome, index }: { outcome: Outcome; index: number }) {
  const short = outcome.label.replace("is ", "");

  return (
    <>
      <article className={`fig-outcome outcome-title-${index + 1}`}>
        <div className="fig-outcome-screen fig-outcome-title"><p>is<br />{short}<br />but we make it</p><h3>{outcome.emphasis}</h3></div>
      </article>
      <article className={`fig-outcome outcome-${index + 1}`}>
        <div className="fig-outcome-screen fig-outcome-detail">
          <div className="circle-field" aria-hidden>{Array.from({ length: 60 }).map((_, dot) => <i key={dot} />)}</div>
          <div className="detail-placeholder"><img src={`/assets/blank-panel${index ? `-${index}` : ""}.png`} alt="" /></div>
          <div className="outcome-detail">
            <p className="outcome-label">Not only</p>
            <h4>{short.toUpperCase()},</h4>
            <p className="outcome-label">but also</p>
            <h4>{outcome.emphasis}</h4>
            <p className="outcome-copy">{outcome.copy}</p>
          </div>
        </div>
      </article>
    </>
  );
}
```

Note `stats` is no longer rendered by `OutcomePanel` (it wasn't rendered in the original component either — check the current file before editing: it declares `stats` in the type but never reads it in JSX). Keep that as-is; the field stays editable in the CMS for future use without forcing a design change now.

Replace the contents of `work/aliaflow-nextjs/components/OutcomeStack.tsx` (only the exported function signature and the two hardcoded headings change — the GSAP logic in the middle is unchanged):

```tsx
"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OutcomePanel, type Outcome } from "./OutcomePanel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={line}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export function OutcomeStack({
  introHeading,
  outcomes,
  manifestoHeading,
  manifestoWords,
}: {
  introHeading: string;
  outcomes: Outcome[];
  manifestoHeading: string;
  manifestoWords: string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const panels = gsap.utils.toArray<HTMLElement>(".fig-outcome", scope.current);

    panels.forEach((panel, index) => {
      const screen = panel.querySelector<HTMLElement>(".fig-outcome-screen");
      if (!screen) return;

      const circles = panel.querySelectorAll<HTMLElement>(".circle-field i");
      const placeholder = panel.querySelector<HTMLElement>(".detail-placeholder");
      const nextPanel = panels[index + 1] as HTMLElement | undefined;

      if (index > 0) {
        gsap.fromTo(
          screen,
          { y: () => window.innerHeight },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top bottom",
              end: "top top",
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      if (nextPanel) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top top",
            endTrigger: nextPanel,
            end: "top top",
            scrub: 0.5,
            pin: panel,
            pinSpacing: false,
            invalidateOnRefresh: true,
          },
        });

        if (circles.length) {
          tl.fromTo(
            circles,
            { autoAlpha: 0, scale: 0.25 },
            { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.6, stagger: 0.06 },
            0,
          );
        }

        if (placeholder) {
          const circlesEnd = circles.length ? (circles.length - 1) * 0.06 + 0.6 : 0;
          tl.fromTo(
            placeholder,
            { autoAlpha: 0, scale: 0.6 },
            { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.6 },
            circlesEnd + 0.3,
          );
        }

        tl.to({}, { duration: Math.max(tl.duration(), 0.1) * 0.6 });
      }
    });

    ScrollTrigger.refresh();
  }, { scope });

  return (
    <div ref={scope} className="outcome-list outcome-stack">
      <article className="fig-outcome outcome-0">
        <div className="fig-outcome-screen outcomes-intro"><h2><Lines text={introHeading} /></h2></div>
      </article>
      {outcomes.map((outcome, index) => <OutcomePanel key={outcome.emphasis} outcome={outcome} index={index} />)}
      <article className="fig-outcome outcome-manifesto">
        <div className="fig-outcome-screen">
          <div className="manifesto-heading"><h2><Lines text={manifestoHeading} /></h2></div>
          <div className="manifesto-content">
            <svg className="fig-shape" viewBox="0 0 200 190" aria-hidden>
              <path d="M77.5,52.4 Q100,10 122.5,52.4 L167.5,137.6 Q190,180 142,180 L58,180 Q10,180 32.5,137.6 Z" fill="#d5d5d5" />
            </svg>
            <p><Lines text={manifestoWords} /></p>
          </div>
        </div>
      </article>
    </div>
  );
}
```

- [ ] **Step 5: `ServiceCatalogueNav` takes `heading` and `tabs` as props**

In `work/aliaflow-nextjs/components/FigmaSections.tsx`, replace only the `catalogueTabs` constant and `ServiceCatalogueNav` function:

```tsx
export function ServiceCatalogueNav({ heading, tabs }: { heading: string; tabs: { number: string; label: string }[] }) {
  return <section className="catalogue-nav">
    <h2>{heading}</h2>
    <ul>
      {tabs.map((tab) => <li key={tab.number}><span>{tab.number}</span>{tab.label}</li>)}
    </ul>
  </section>;
}
```

(Delete the old `catalogueTabs` constant above it — it is no longer used.)

- [ ] **Step 6: Type-check (component prop types will not fully resolve until Task 12 updates `page.tsx` — that is expected)**

Run: `npx tsc --noEmit`
Expected: errors only in `app/page.tsx` (it still calls these components with the old, no-longer-matching props/no props) — no errors inside the files touched in this task themselves. Confirm every reported error's file is `app/page.tsx`.

- [ ] **Step 7: Commit**

```bash
git add components/Header.tsx components/Hero.tsx components/Footer.tsx components/OutcomePanel.tsx components/OutcomeStack.tsx components/FigmaSections.tsx
git commit -m "Make Header, Hero, Footer, Outcomes, and ServiceCatalogueNav prop-driven"
```

---

### Task 11: Wire the public site's FigmaSections groups to CMS content

**Files:**
- Modify: `work/aliaflow-nextjs/components/FigmaSections.tsx` (`BusinessLeadership`, `TechnocraticDesign`, `ExecutionManagement`, `WhyChooseUs`, `PortfolioAndPeople`, `TestimonialsAndFooter`)
- Modify: `work/aliaflow-nextjs/components/ThrivableBusiness.tsx`

**Interfaces:**
- Consumes: nothing new (plain props matching the Task 3 schemas for `business-leadership`, `technocratic-design`, `execution-management`, `why-choose-us`, `portfolio-people`, `testimonials-footer`, `thrivable-business`).
- Produces: prop-driven versions of these components, consumed by `app/page.tsx` in Task 12.

No automated test — verified visually together with Task 12.

- [ ] **Step 1: `BusinessLeadership` and `TechnocraticDesign` take props, with cards nested per statement**

In `work/aliaflow-nextjs/components/FigmaSections.tsx`, add `import { Fragment } from "react";` to the top of the file (it currently only imports `Image` from `next/image`). Keep `DepartmentHeading`, `QuestionHero`, `ServiceStatement`, `ThreeCards`, `EventPromo` exactly as they are (they are already prop-driven and reusable). Replace the `BusinessLeadership` and `TechnocraticDesign` functions. Each statement is interleaved with its own `ThreeCards` block, matching the original DOM order (statement, cards, statement, cards, ...):

```tsx
type StatementWithCards = { number: string; title: string; body: string; cards: { title: string; image?: string }[] };

export function BusinessLeadership({
  question,
  statements,
  holocratic_line,
  event_title,
  event_image,
}: {
  question: string;
  statements: StatementWithCards[];
  holocratic_line: string;
  event_title: string;
  event_image: string;
}) {
  return <>
    <DepartmentHeading title="BUSINESS LEADERSHIP" />
    <QuestionHero title="BUSINESS LEADERSHIP" question={question} />
    {statements.map((statement) => (
      <Fragment key={statement.number}>
        <ServiceStatement dark number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards dark items={statement.cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>
    ))}
    <section className="holocratic"><p>{holocratic_line}</p></section>
    <EventPromo dark title={event_title} image={event_image} />
  </>;
}

export function TechnocraticDesign({
  question,
  pillars,
  statements,
  event_title,
  event_image,
}: {
  question: string;
  pillars: { label: string }[];
  statements: StatementWithCards[];
  event_title: string;
  event_image: string;
}) {
  return <>
    <DepartmentHeading title="TECHNOCRATIC DESIGN" />
    <QuestionHero title="TECHNOCRATIC DESIGN" question={question} />
    <section className="design-pillars">{pillars.map((pillar) => <span key={pillar.label}><i className="mini-icon" /><b>{pillar.label}</b></span>)}</section>
    {statements.map((statement) => (
      <Fragment key={statement.number}>
        <ServiceStatement number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards items={statement.cards.map((card) => ({ title: card.title, image: card.image }))} />
      </Fragment>
    ))}
    <EventPromo title={event_title} image={event_image} />
  </>;
}
```

- [ ] **Step 2: `ExecutionManagement` takes props**

Replace the `ExecutionManagement` function:

```tsx
export function ExecutionManagement({
  heading,
  orbit_labels,
  emphasized_label,
  body,
}: {
  heading: string;
  orbit_labels: { label: string }[];
  emphasized_label: string;
  body: string;
}) {
  return <section className="execution-management">
    <h2>{heading}</h2>
    <div className="execution-orbits">
      {orbit_labels.slice(0, 2).map((item) => <span key={item.label}><Lines text={item.label} /></span>)}
      <strong><Lines text={emphasized_label} /></strong>
      {orbit_labels.slice(2).map((item) => <span key={item.label}><Lines text={item.label} /></span>)}
    </div>
    <p>{body}</p>
  </section>;
}
```

Add a small local `Lines` helper (mirrors the one in `OutcomeStack.tsx`, kept local here since it is a leaf helper used in this file only) directly above `ExecutionManagement`:

```tsx
function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => <Fragment key={line}>{i > 0 ? <br /> : null}{line}</Fragment>)}</>;
}
```

- [ ] **Step 3: `WhyChooseUs` takes props**

Replace the `WhyChooseUs` function:

```tsx
export function WhyChooseUs({
  eyebrow,
  heading,
  points,
}: {
  eyebrow: string;
  heading: string;
  points: { label: string; body: string }[];
}) {
  return <section className="why-us">
    <p>{eyebrow}</p>
    <h2><Lines text={heading} /></h2>
    <div className="business-ring">BUSINESS<br />THRIVABILITY</div>
    <div className="why-list">
      {points.map((point, i) => <article key={point.label}><b>0{i + 1}</b><div><h3>{point.label}</h3><p>{point.body}</p></div></article>)}
    </div>
  </section>;
}
```

- [ ] **Step 4: `PortfolioAndPeople` takes props**

Replace the `PortfolioAndPeople` function:

```tsx
export function PortfolioAndPeople({
  timeline,
  people,
  toolkits,
}: {
  timeline: { year: string; label: string }[];
  people: { name: string; role: string; image: string }[];
  toolkits: { title: string; body: string }[];
}) {
  return <section className="portfolio">
    <h2>PORTFOLIO</h2>
    <div className="portfolio-years">
      {timeline.map((entry, i) => (
        i === 1
          ? <strong key={`${entry.year}-${i}`}>{entry.year}<br /><i>{entry.label}</i></strong>
          : <span key={`${entry.year}-${i}`}>{entry.year}<br /><i>{entry.label}</i></span>
      ))}
    </div>
    <h2>PEOPLE</h2>
    <div className="people-grid">
      {people.map((person) => <article key={person.name}><h3>{person.name}</h3><p>{person.role}</p><Image src={person.image} alt="" width={220} height={290} /></article>)}
    </div>
    <h2>DESIGN TOOLKITS</h2>
    <div className="toolkits">
      {toolkits.map((toolkit) => <article key={toolkit.title}><h3>{toolkit.title}</h3><p>{toolkit.body}</p></article>)}
    </div>
  </section>;
}
```

- [ ] **Step 5: `TestimonialsAndFooter` takes props**

Replace the `TestimonialsAndFooter` function:

```tsx
export function TestimonialsAndFooter({
  trust_heading,
  trust_subheading,
  partners,
  testimonials,
  closing_heading,
  closing_body,
}: {
  trust_heading: string;
  trust_subheading: string;
  partners: { name: string }[];
  testimonials: { name: string; role: string; title: string; body: string }[];
  closing_heading: string;
  closing_body: string;
}) {
  return <>
    <section className="trust-banner"><h2>{trust_heading}</h2><p>{trust_subheading}</p></section>
    <section className="partners">
      <h2>PARTNERS</h2>
      <div>{partners.map((partner, i) => <span key={`${partner.name}-${i}`}><i />{partner.name}</span>)}</div>
      <h2>TESTIMONIAL</h2>
      <div className="testimonials">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name}><b>{testimonial.name}</b><small>{testimonial.role}</small><h3>{testimonial.title}</h3><p>{testimonial.body}</p></article>
        ))}
      </div>
    </section>
    <section className="what-if"><h2><Lines text={closing_heading} /></h2><p><Lines text={closing_body} /></p></section>
  </>;
}
```

- [ ] **Step 6: `ThrivableBusiness` takes props**

Replace the entire contents of `work/aliaflow-nextjs/components/ThrivableBusiness.tsx`:

```tsx
import Image from "next/image";
import { Fragment, type ReactNode } from "react";

function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => <Fragment key={line}>{i > 0 ? <br /> : null}{line}</Fragment>)}</>;
}

function LoopMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#8b8b8b" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
      <path d="M13 20v-5a2 2 0 0 1 2-2h5" />
      <path d="M35 20v-5a2 2 0 0 0-2-2h-5" />
      <path d="M13 28v5a2 2 0 0 0 2 2h5" />
      <path d="M35 28v5a2 2 0 0 1-2 2h-5" />
      <path d="M24 17v14M18 24h12" />
    </svg>
  );
}

function CultureMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#8b8b8b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M24 11l11 4v9c0 7-4.6 11.4-11 13-6.4-1.6-11-6-11-13v-9z" />
      <circle cx="24" cy="23" r="3.4" />
      <path d="M18.5 32c1.3-2.6 3.3-3.9 5.5-3.9s4.2 1.3 5.5 3.9" />
    </svg>
  );
}

function ServiceBlock({ number, title, body, mark }: { number: string; title: string; body: string; mark: ReactNode }) {
  return (
    <article className="future-book">
      <div className="future-book-copy">
        <h3><b>{number}</b> {title}</h3>
        <p>{body}</p>
      </div>
      <div className="future-book-mark">{mark}</div>
    </article>
  );
}

function TileGrid({ items, contain = false }: { items: { image: string; label: string; title: string }[]; contain?: boolean }) {
  const lorem =
    "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.";
  return (
    <div className="future-grid">
      {items.map((item) => (
        <article key={item.title} className="future-card">
          <div className={`future-map${contain ? " future-map-contain" : ""}`}>
            <Image src={item.image} alt="" fill sizes="33vw" />
          </div>
          <div className="future-card-copy">
            <small>{item.label}</small>
            <h3>{item.title}</h3>
            <p>{lorem}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export type ThrivableBusinessData = {
  heading: string;
  question_image: string;
  question: string;
  service_blocks: { number: string; title: string; body: string }[];
  futures: { title: string; heading: string; tags: string }[];
  loops: { image: string; label: string; title: string }[];
  cultures: { image: string; label: string; title: string }[];
  magazine_heading: string;
  magazine_price: string;
  magazine_image: string;
  jam_heading: string;
  jam_date: string;
  jam_body: string;
  jam_image: string;
};

export function ThrivableBusiness({
  heading,
  question_image,
  question,
  service_blocks,
  futures,
  loops,
  cultures,
  magazine_heading,
  magazine_price,
  magazine_image,
  jam_heading,
  jam_date,
  jam_body,
  jam_image,
}: ThrivableBusinessData) {
  const marks = [<Image key="cyborg" src="/assets/cyborg.png" alt="" fill sizes="130px" />, <LoopMark key="loop" />, <CultureMark key="culture" />];

  return (
    <section className="thrivable-business" aria-labelledby="thrivable-title">
      <header className="thrivable-heading">
        <span aria-hidden="true" />
        <h2 id="thrivable-title">{heading}</h2>
      </header>

      <section className="thrivable-question" aria-label="Where to play, how to win">
        <Image src={question_image} alt="A leader standing at the intersection of business pathways" fill sizes="100vw" priority />
        <h3><Lines text={question} /></h3>
      </section>

      {service_blocks[0] ? <ServiceBlock number={service_blocks[0].number} title={service_blocks[0].title} body={service_blocks[0].body} mark={marks[0]} /> : null}

      <div className="future-grid">
        {futures.map((future) => (
          <article key={future.title} className="future-card">
            <div className="future-map" aria-hidden="true"><Image src="/assets/pastel-metro-network.png" alt="" fill sizes="33vw" /></div>
            <div className="future-card-title">{future.title.replace(" ", "\n")}</div>
            <div className="future-card-copy">
              <small>Industry Name</small>
              <h3><Lines text={future.heading} /></h3>
              <p><Lines text={future.tags} /></p>
            </div>
          </article>
        ))}
      </div>

      {service_blocks[1] ? <ServiceBlock number={service_blocks[1].number} title={service_blocks[1].title} body={service_blocks[1].body} mark={marks[1]} /> : null}
      <TileGrid items={loops} contain />

      {service_blocks[2] ? <ServiceBlock number={service_blocks[2].number} title={service_blocks[2].title} body={service_blocks[2].body} mark={marks[2]} /> : null}
      <TileGrid items={cultures} />

      <section className="magazine-promo">
        <div className="magazine-copy">
          <h2><Lines text={magazine_heading} /></h2>
          <p className="magazine-price">{magazine_price}</p>
          <button type="button">Buy Magazine</button>
        </div>
        <div className="magazine-art"><Image src={magazine_image} alt="Future of Banking magazine spread" fill sizes="60vw" /></div>
      </section>

      <section className="jam-promo">
        <div className="jam-copy">
          <h2><Lines text={jam_heading} /></h2>
          <p className="jam-date">{jam_date}</p>
          <p>{jam_body}</p>
          <button type="button">Book Now</button>
        </div>
        <div className="jam-art"><Image src={jam_image} alt="Venue for the Banking Thrivability JAM" fill sizes="60vw" /></div>
      </section>
    </section>
  );
}
```

- [ ] **Step 7: Type-check**

Run: `npx tsc --noEmit`
Expected: errors remain only in `app/page.tsx` (fixed in Task 12) — every file touched in this task must be error-free on its own.

- [ ] **Step 8: Commit**

```bash
git add components/FigmaSections.tsx components/ThrivableBusiness.tsx
git commit -m "Make Business Leadership, Technocratic Design, Execution Management, Why Choose Us, Portfolio, Testimonials, and Thrivable Business prop-driven"
```

---

### Task 12: Load all sections in `app/page.tsx` and verify the full site end-to-end

**Files:**
- Modify: `work/aliaflow-nextjs/app/page.tsx`
- Modify: `work/aliaflow-nextjs/README.md`

**Interfaces:**
- Consumes: `getSection` (Task 4), every prop-driven component from Tasks 10-11.

- [ ] **Step 1: Rewrite the page to fetch every section server-side**

Replace the contents of `work/aliaflow-nextjs/app/page.tsx`:

```tsx
import { Footer, type FooterData } from "../components/Footer";
import { Header, type HeaderData } from "../components/Header";
import { Hero, type HeroData } from "../components/Hero";
import { OutcomeStack } from "../components/OutcomeStack";
import type { Outcome } from "../components/OutcomePanel";
import {
  BusinessLeadership,
  ExecutionManagement,
  PortfolioAndPeople,
  ServiceCatalogueNav,
  TechnocraticDesign,
  TestimonialsAndFooter,
  WhyChooseUs,
} from "../components/FigmaSections";
import { ThrivableBusiness, type ThrivableBusinessData } from "../components/ThrivableBusiness";
import { getSection } from "../lib/sections";

async function requireSection<T>(key: string): Promise<T> {
  const data = await getSection(key);
  if (!data) throw new Error(`Section "${key}" is not seeded. Run \`npm run seed\`.`);
  return data as T;
}

export default async function Home() {
  const [
    header,
    hero,
    outcomes,
    serviceCatalogueNav,
    thrivableBusiness,
    businessLeadership,
    technocraticDesign,
    executionManagement,
    whyChooseUs,
    portfolioPeople,
    testimonialsFooter,
    footer,
  ] = await Promise.all([
    requireSection<HeaderData>("header"),
    requireSection<HeroData>("hero"),
    requireSection<{ intro_heading: string; items: Outcome[]; manifesto_heading: string; manifesto_words: string }>("outcomes"),
    requireSection<{ heading: string; tabs: { number: string; label: string }[] }>("service-catalogue-nav"),
    requireSection<ThrivableBusinessData>("thrivable-business"),
    requireSection<Parameters<typeof BusinessLeadership>[0]>("business-leadership"),
    requireSection<Parameters<typeof TechnocraticDesign>[0]>("technocratic-design"),
    requireSection<Parameters<typeof ExecutionManagement>[0]>("execution-management"),
    requireSection<Parameters<typeof WhyChooseUs>[0]>("why-choose-us"),
    requireSection<Parameters<typeof PortfolioAndPeople>[0]>("portfolio-people"),
    requireSection<Parameters<typeof TestimonialsAndFooter>[0]>("testimonials-footer"),
    requireSection<FooterData>("footer"),
  ]);

  return (
    <main>
      <Header {...header} />
      <Hero {...hero} />
      <OutcomeStack
        introHeading={outcomes.intro_heading}
        outcomes={outcomes.items}
        manifestoHeading={outcomes.manifesto_heading}
        manifestoWords={outcomes.manifesto_words}
      />
      <ServiceCatalogueNav {...serviceCatalogueNav} />
      <ThrivableBusiness {...thrivableBusiness} />
      <BusinessLeadership {...businessLeadership} />
      <TechnocraticDesign {...technocraticDesign} />
      <ExecutionManagement {...executionManagement} />
      <WhyChooseUs {...whyChooseUs} />
      <PortfolioAndPeople {...portfolioPeople} />
      <TestimonialsAndFooter {...testimonialsFooter} />
      <Footer {...footer} />
    </main>
  );
}
```

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: exits 0, no errors anywhere.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: build completes successfully (exit 0), including the `/` route and the `/admin/*` routes in the route list it prints.

- [ ] **Step 4: Full manual verification pass**

```bash
npm run dev &
sleep 3
```

In a browser:
1. Open `http://localhost:3000/` — confirm the page renders identically to how it looked before this project started (same text, same images, same layout).
2. Open `http://localhost:3000/admin`, log in, and for each of the 12 sections in the sidebar, edit one field (pick at least one `text`, one `textarea`, one `image`, and one `list` field across the set) and save.
3. Reload `http://localhost:3000/` after each edit and confirm the change appears.
4. Confirm image upload: on the Hero section, choose a different local image file, confirm it uploads, the preview updates, and after saving the public Hero section shows the new image.

```bash
kill %1
```

- [ ] **Step 5: Update the README**

Modify `work/aliaflow-nextjs/README.md` — replace its content with:

```md
# Aliaflow — single-user CMS

Next.js 15 app serving the Aliaflow public site and a single-user admin CMS at `/admin`.

## Setup

```bash
npm install
cp .env.example .env   # fill in SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npx prisma generate
npx prisma db push
npm run seed            # creates the admin user and seeds all 12 sections
npm run dev
```

Public site: `http://localhost:3000`
Admin panel: `http://localhost:3000/admin` (log in with `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`)

## Content model

Every editable section is a row in the `Section` table (`prisma/schema.prisma`), storing
a JSON blob whose shape is declared in `lib/sections.schema.ts`. The admin panel has one
generic form component (`components/admin/DynamicSectionForm.tsx`) that renders a form
for any section purely from that schema — adding a new editable field means editing
`lib/sections.schema.ts`, not building a new form.

## Tests

```bash
npm test
```

Covers the schema validator (`lib/section-validation.ts`), the section schema
definitions (`lib/sections.schema.ts`), and the auth helpers (`lib/auth.ts`).
API routes and the admin UI are verified manually — see the plan at
`docs/superpowers/plans/2026-09-07-aliaflow-cms.md` for the exact `curl` and
browser steps.
```

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx README.md
git commit -m "Load all sections from the CMS on the public site"
```

---

## Post-plan note for deployment (Arvan Cloud VPS)

Not a task in this plan (deployment itself is out of scope), but worth recording for
whoever ships this: `prisma/dev.db` must persist across deploys (mount it on a
persistent volume/path, don't let a build step recreate it), `public/uploads/` needs
the same treatment, and `SESSION_SECRET`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` must be set as
real environment variables on the server (never commit `.env`).
