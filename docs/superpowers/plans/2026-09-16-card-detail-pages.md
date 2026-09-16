# Card Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the 27 marketing cards its own article page at `/services/[section]/[slug]`, styled as the same publication as the landing page.

**Architecture:** A registry module (`lib/card-pages.ts`) is the single place that maps nine route segments onto existing section records and resolves a card by slug. Article content lives inside the card it belongs to, in the section record that already holds it; the recursive validator in `lib/section-validation.ts` already supports the nested lists this needs. One dynamic route renders presentational blocks from `components/card-page/`.

**Tech Stack:** Next.js App Router (server components), TypeScript, Prisma + SQLite, Vitest (node environment), plain CSS files imported from `app/layout.tsx`.

All paths in this plan are relative to `work/aliaflow-nextjs/`.

## Global Constraints

- Design source of truth: `docs/superpowers/specs/2026-09-16-card-detail-pages-design.md`.
- Site only. Do NOT build CMS editor UI for the new fields.
- The landing page's appearance must not change, apart from cards gaining a link affordance.
- Every new content field is optional. A card with no article content must still render its landing card and its article page.
- No new colours. Use only `#fff`, `#aaa`, `#292929`, `#555`, `#f1f1f1`, `#f4f4f4`, `#f7f7f7`, `#d3d3d3`, `#474747`, `#f5f5f5`, `#686868`, `#2557d6`.
- No rounded corners except full circles (`border-radius: 50%`).
- Body copy in the article column is `16px / 1.45`. This is the ONLY intentional departure from the landing's `1.14`–`1.3` line-height.
- Run tests with `npm test` from `work/aliaflow-nextjs/`.
- End every commit message with:
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`

## File Structure

| File | Responsibility |
|---|---|
| `lib/card-pages.ts` (create) | Registry of nine sections; slug derivation; display-title and hero-image resolution; card lookup. The only module that knows the section-to-data mapping. |
| `lib/card-pages.test.ts` (create) | Unit tests for the above. |
| `lib/sections.schema.ts` (modify) | Adds the new card fields to five card lists. |
| `lib/sections.schema.test.ts` (modify) | Asserts the new fields validate, and that a bare card still passes. |
| `prisma/seed.ts` (modify) | Seed article content for all 27 cards. |
| `components/card-page/ArticleHeader.tsx` (create) | Breadcrumb, title band, hero image. |
| `components/card-page/ArticleBody.tsx` (create) | Lead, body sections, key points. |
| `components/card-page/ArticleFooter.tsx` (create) | CTA band and related rail. |
| `app/services/[section]/[slug]/page.tsx` (create) | Route: data fetch, metadata, composition. |
| `app/card-page.css` (create) | All article-page styling, light and dark. |
| `app/layout.tsx` (modify) | Imports `card-page.css`. |
| `components/ThrivableBusiness.tsx` (modify) | `TileGrid` cards become links. |
| `components/FigmaSections.tsx` (modify) | Passes slug/link data into the image rail; marks padding slides `aria-hidden`. |
| `components/FutureImageCarousel.tsx` (modify) | `CarouselSlide` becomes a link when given an href. |

---

### Task 1: Registry, slug derivation, and card resolution

**Files:**
- Create: `lib/card-pages.ts`
- Test: `lib/card-pages.test.ts`

**Interfaces:**
- Consumes: `getSection` from `lib/sections.ts` (signature: `(key: string) => Promise<Record<string, unknown> | null>`).
- Produces:
  - `type CardPageTheme = "light" | "dark"`
  - `type CardPageSection = { segment: string; sectionKey: string; list: string | { statements: string }; theme: CardPageTheme; number: string; label: string; anchor: string }`
  - `CARD_PAGE_SECTIONS: CardPageSection[]`
  - `findSection(segment: string): CardPageSection | undefined`
  - `slugify(value: string): string`
  - `displayTitle(card: RawCard): string`
  - `cardSlug(card: RawCard): string`
  - `heroImage(card: RawCard, sectionData: Record<string, unknown>): string`
  - `extractCards(section: CardPageSection, sectionData: Record<string, unknown>): RawCard[]`
  - `duplicateSlugs(cards: RawCard[]): string[]`
  - `type RawCard = Record<string, unknown>`

- [ ] **Step 1: Write the failing test**

Create `lib/card-pages.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  CARD_PAGE_SECTIONS,
  cardSlug,
  displayTitle,
  duplicateSlugs,
  extractCards,
  findSection,
  heroImage,
  slugify,
} from "./card-pages";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugify("Future of Banking")).toBe("future-of-banking");
  });

  it("strips punctuation", () => {
    expect(slugify("Brand Culture & XP!")).toBe("brand-culture-xp");
  });

  it("leaves an already-slugged value unchanged", () => {
    expect(slugify("future-of-banking")).toBe("future-of-banking");
  });

  it("collapses repeated separators and trims them", () => {
    expect(slugify("  Risk --- Setting  ")).toBe("risk-setting");
  });
});

describe("displayTitle", () => {
  it("prefers heading when set", () => {
    expect(displayTitle({ heading: "Business Game", title: "alt text" })).toBe("Business Game");
  });

  it("falls back to title when heading is blank", () => {
    expect(displayTitle({ heading: "", title: "Future of Banking" })).toBe("Future of Banking");
  });
});

describe("cardSlug", () => {
  it("uses an explicit slug", () => {
    expect(cardSlug({ slug: "custom", title: "Future of Banking" })).toBe("custom");
  });

  it("derives from the display title when slug is blank", () => {
    expect(cardSlug({ slug: "", heading: "Business Game 1" })).toBe("business-game-1");
  });
});

describe("CARD_PAGE_SECTIONS", () => {
  it("declares nine sections with unique segments", () => {
    expect(CARD_PAGE_SECTIONS).toHaveLength(9);
    const segments = CARD_PAGE_SECTIONS.map((s) => s.segment);
    expect(new Set(segments).size).toBe(9);
  });

  it("finds a section by segment and returns undefined for an unknown one", () => {
    expect(findSection("risk-setting")?.sectionKey).toBe("technocratic-design");
    expect(findSection("nope")).toBeUndefined();
  });
});

describe("extractCards", () => {
  const thrivable = { futures: [{ title: "Future of Banking" }] };

  it("reads a top-level list", () => {
    const section = findSection("future-of-x-book")!;
    expect(extractCards(section, thrivable)).toHaveLength(1);
  });

  it("finds a statement by number, not by array position", () => {
    const section = findSection("leadership-model")!;
    const reordered = {
      statements: [
        { number: "6", cards: [{ title: "Leadership model 1" }] },
        { number: "4", cards: [{ title: "Business Game 1" }] },
        { number: "5", cards: [{ title: "Strategic Role 1" }] },
      ],
    };
    expect(displayTitle(extractCards(section, reordered)[0])).toBe("Leadership model 1");
  });

  it("returns an empty array when the section data is missing the list", () => {
    expect(extractCards(findSection("future-of-x-book")!, {})).toEqual([]);
  });
});

describe("heroImage", () => {
  const sectionData = { question_image: "/assets/question.png" };

  it("prefers the card's own hero image", () => {
    expect(heroImage({ hero_image: "/a.png", image: "/b.png" }, sectionData)).toBe("/a.png");
  });

  it("falls back to the parent question image before the card image", () => {
    expect(heroImage({ hero_image: "", image: "/b.png" }, sectionData)).toBe("/assets/question.png");
  });

  it("falls back to the card image when there is no question image", () => {
    expect(heroImage({ image: "/b.png" }, {})).toBe("/b.png");
  });

  it("returns an empty string when nothing is available", () => {
    expect(heroImage({}, {})).toBe("");
  });
});

describe("duplicateSlugs", () => {
  it("reports a slug used twice", () => {
    expect(duplicateSlugs([{ title: "A" }, { title: "A" }])).toEqual(["a"]);
  });

  it("reports nothing when all slugs are unique", () => {
    expect(duplicateSlugs([{ title: "A" }, { title: "B" }])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- card-pages`
Expected: FAIL — `Failed to resolve import "./card-pages"`.

- [ ] **Step 3: Write the implementation**

Create `lib/card-pages.ts`:

```ts
export type CardPageTheme = "light" | "dark";

export type RawCard = Record<string, unknown>;

/**
 * One entry per clickable card section. `list` names a top-level array on the
 * section record; `statement` instead selects a statement by its `number` field
 * and reads that statement's `cards`. Statements are addressed by number rather
 * than array position so that reordering them in the CMS cannot silently
 * retarget every article URL in the section.
 */
export type CardPageSection = {
  segment: string;
  sectionKey: string;
  list?: string;
  statement?: string;
  theme: CardPageTheme;
  number: string;
  label: string;
  anchor: string;
  /**
   * "photo" cards carry a plain photograph and crop well. "composed" cards are
   * complete pre-designed cards with their text baked into the pixels, so they
   * must be shown whole rather than cropped.
   */
  cardArt: "photo" | "composed";
};

export const CARD_PAGE_SECTIONS: CardPageSection[] = [
  { segment: "future-of-x-book", sectionKey: "thrivable-business", list: "futures", theme: "light", number: "1", label: "Future of X Book", anchor: "/#thrivable-title", cardArt: "photo" },
  { segment: "critical-business-loop", sectionKey: "thrivable-business", list: "loops", theme: "light", number: "2", label: "Critical Business Loop", anchor: "/#thrivable-title", cardArt: "photo" },
  { segment: "brand-culture-xp", sectionKey: "thrivable-business", list: "cultures", theme: "light", number: "3", label: "Brand Culture & XP", anchor: "/#thrivable-title", cardArt: "photo" },
  { segment: "business-game", sectionKey: "business-leadership", statement: "4", theme: "dark", number: "4", label: "Business Game", anchor: "/#business-leadership", cardArt: "composed" },
  { segment: "strategic-roles", sectionKey: "business-leadership", statement: "5", theme: "dark", number: "5", label: "Strategic Roles", anchor: "/#business-leadership", cardArt: "composed" },
  { segment: "leadership-model", sectionKey: "business-leadership", statement: "6", theme: "dark", number: "6", label: "Leadership Model", anchor: "/#business-leadership", cardArt: "composed" },
  { segment: "risk-setting", sectionKey: "technocratic-design", statement: "7", theme: "light", number: "7", label: "Risk Setting", anchor: "/#technocratic-design-heading", cardArt: "composed" },
  { segment: "change-solving", sectionKey: "technocratic-design", statement: "8", theme: "light", number: "8", label: "Change Solving", anchor: "/#technocratic-design-heading", cardArt: "composed" },
  { segment: "performance-testing", sectionKey: "technocratic-design", statement: "9", theme: "light", number: "9", label: "Performance Testing", anchor: "/#technocratic-design-heading", cardArt: "composed" },
];

export function findSection(segment: string): CardPageSection | undefined {
  return CARD_PAGE_SECTIONS.find((section) => section.segment === segment);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(card: RawCard, key: string): string {
  const value = card[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The three structured sections carry a real display title in `title`. The six
 * image-card sections use `title` for alt text — the landing page passes it to
 * the `alt` attribute — so they carry their display title in `heading` instead.
 */
export function displayTitle(card: RawCard): string {
  return str(card, "heading") || str(card, "title");
}

export function cardSlug(card: RawCard): string {
  return str(card, "slug") || slugify(displayTitle(card));
}

/**
 * A card image in the six image-card sections is a complete pre-designed card
 * with its text baked into the pixels. At hero width that text would reappear
 * at the wrong scale beside the real HTML title, so the parent section's
 * photograph is preferred over it.
 */
export function heroImage(card: RawCard, sectionData: Record<string, unknown>): string {
  const own = str(card, "hero_image");
  if (own) return own;
  const question = sectionData.question_image;
  if (typeof question === "string" && question.trim()) return question.trim();
  return str(card, "image");
}

export function extractCards(section: CardPageSection, sectionData: Record<string, unknown>): RawCard[] {
  if (section.list) {
    const value = sectionData[section.list];
    return Array.isArray(value) ? (value as RawCard[]) : [];
  }
  const statements = sectionData.statements;
  if (!Array.isArray(statements)) return [];
  const match = (statements as RawCard[]).find((item) => str(item, "number") === section.statement);
  const cards = match?.cards;
  return Array.isArray(cards) ? (cards as RawCard[]) : [];
}

export function duplicateSlugs(cards: RawCard[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const card of cards) {
    const slug = cardSlug(card);
    if (seen.has(slug)) duplicates.add(slug);
    seen.add(slug);
  }
  return [...duplicates];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- card-pages`
Expected: PASS, 17 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/card-pages.ts lib/card-pages.test.ts
git commit -m "feat: add card page registry and slug resolution

Statements are addressed by their number field rather than by array
position, so reordering them cannot silently retarget article URLs.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Schema fields for article content

**Files:**
- Modify: `lib/sections.schema.ts`
- Test: `lib/sections.schema.test.ts`

**Interfaces:**
- Consumes: the `text`, `textarea`, `image`, `list` helpers already defined at the top of `lib/sections.schema.ts`.
- Produces: a shared `articleFields()` helper used by all five card lists.

- [ ] **Step 1: Write the failing test**

Append to `lib/sections.schema.test.ts`:

```ts
describe("article fields on card lists", () => {
  const cardLists: [string, string[]][] = [
    ["thrivable-business", ["futures", "loops", "cultures"]],
    ["business-leadership", ["statements"]],
    ["technocratic-design", ["statements"]],
  ];

  function cardFields(sectionKey: string, listKey: string) {
    const list = sectionSchemas[sectionKey].fields[listKey];
    if (list.type !== "list") throw new Error(`${listKey} is not a list`);
    if (listKey !== "statements") return list.fields;
    const cards = list.fields.cards;
    if (cards.type !== "list") throw new Error("cards is not a list");
    return cards.fields;
  }

  it("every card list carries the article fields", () => {
    for (const [sectionKey, lists] of cardLists) {
      for (const listKey of lists) {
        const fields = cardFields(sectionKey, listKey);
        for (const name of ["slug", "hero_image", "hero_image_alt", "lead", "cta_heading", "cta_label", "cta_href"]) {
          expect(fields[name], `${sectionKey}.${listKey}.${name}`).toBeDefined();
        }
        expect(fields.sections?.type, `${sectionKey}.${listKey}.sections`).toBe("list");
        expect(fields.key_points?.type, `${sectionKey}.${listKey}.key_points`).toBe("list");
      }
    }
  });

  it("image-card sections gain heading, label and body", () => {
    for (const sectionKey of ["business-leadership", "technocratic-design"]) {
      const fields = cardFields(sectionKey, "statements");
      for (const name of ["heading", "label", "body"]) {
        expect(fields[name], `${sectionKey}.${name}`).toBeDefined();
      }
      expect(fields.title, `${sectionKey}.title still present`).toBeDefined();
    }
  });

  it("a card carrying no article content still validates once normalized", () => {
    const schema = sectionSchemas["business-leadership"];
    const normalized = normalizeSectionData(schema.fields, {
      statements: [{ number: "4", title: "t", body: "b", cards: [{ title: "alt", image: "/a.png" }] }],
    });
    expect(validateSectionData(schema.fields, normalized)).toEqual([]);
  });
});
```

Add `normalizeSectionData` to the existing import from `./section-validation` at
the top of the file. This last test is the one that guarantees the Global
Constraint that every new field is optional.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- sections.schema`
Expected: FAIL — `expected undefined to be defined` for `thrivable-business.futures.slug`.

- [ ] **Step 3: Write the implementation**

In `lib/sections.schema.ts`, add after the `list` helper:

```ts
/**
 * Article content for a card's detail page at /services/<section>/<slug>.
 * Every field is optional: a card with none of them still renders on the
 * landing page and still produces a (sparse) article page.
 */
function articleFields(): Record<string, FieldSchema> {
  return {
    slug: text("URL slug", "Leave blank to derive it from the title."),
    hero_image: image("Article hero image", "Leave blank to use this section's question image."),
    hero_image_alt: text("Article hero image description"),
    lead: textarea("Article lead paragraph"),
    sections: list("Article sections", "Section", {
      heading: text("Heading"),
      body: textarea("Body"),
    }, "The body of the article, in order."),
    key_points: list("Key points", "Point", {
      title: text("Title"),
      body: textarea("Body"),
    }, "Shown as a numbered row beneath the article body."),
    cta_heading: text("Closing call-to-action heading"),
    cta_label: text("Closing button label", undefined, "Start a conversation"),
    cta_href: text("Closing button URL", undefined, "#contact-us"),
  };
}
```

Then spread it into all five card lists. For the three `TileGrid` lists in
`thrivable-business`, each currently reads:

```ts
      futures: list("Future of X tiles", "Tile", {
        image: image("Card image", "Used in this card only."),
        label: text("Label"),
        title: text("Title"),
        body: textarea("Body"),
        image_alt: text("Card image description"),
      }, "Add, remove, and reorder the Future of X Book cards."),
```

Add `...articleFields(),` as the last entry inside each of the three field
objects (`futures`, `loops`, `cultures`), keeping their existing fields and
descriptions unchanged.

For the `cards` list inside `statements` in BOTH `business-leadership` and
`technocratic-design`, replace:

```ts
        cards: list("Cards", "Card", {
          title: text("Image description", "Used as accessible alternative text and for an empty-card placeholder."),
          image: image("Complete card image", "Upload the finished card artwork for this card only."),
        }, "Add, remove, and reorder the image cards shown under this statement."),
```

with:

```ts
        cards: list("Cards", "Card", {
          title: text("Image description", "Used as accessible alternative text and for an empty-card placeholder."),
          image: image("Complete card image", "Upload the finished card artwork for this card only."),
          heading: text("Article title", "Shown on this card's detail page. The image description above stays as alt text."),
          label: text("Article label", "Small label above the article title, such as the industry."),
          body: textarea("Article summary"),
          ...articleFields(),
        }, "Add, remove, and reorder the image cards shown under this statement."),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- sections.schema`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/sections.schema.ts lib/sections.schema.test.ts
git commit -m "feat: add article content fields to card schemas

Image-card sections get a separate heading field: their title is passed to
the alt attribute by the landing page, so it cannot double as a display title.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Seed article content

**Files:**
- Modify: `prisma/seed.ts`

**Interfaces:**
- Consumes: `articleFields()` shape from Task 2.
- Produces: seeded article content for all 27 cards, so every route resolves.

- [ ] **Step 1: Add a seed helper**

Near the top of `prisma/seed.ts`, after the existing imports, add:

```ts
/**
 * Placeholder article content. The copy matches the tone of the existing
 * seeded card bodies; real copy replaces it through the CMS.
 */
function article(slug: string, lead: string) {
  return {
    slug,
    hero_image: "",
    hero_image_alt: "",
    lead,
    sections: [
      {
        heading: "Where it starts",
        body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet. Consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis elit sed do eismod.",
      },
      {
        heading: "How we work through it",
        body: "Sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit. Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet consevbi adis.",
      },
    ],
    key_points: [
      { title: "Shared language", body: "Everyone in the room describes the same future with the same words." },
      { title: "Evidence first", body: "Weak signals and emerging trends, not opinion, set the direction." },
      { title: "Built to move", body: "Every output is something your team can act on the following week." },
    ],
    cta_heading: "Start the conversation",
    cta_label: "Start a conversation",
    cta_href: "#contact-us",
  };
}
```

- [ ] **Step 2: Spread it into the three TileGrid lists**

In the `thrivable-business` record, each `futures` / `loops` / `cultures` entry
gains a spread. For example the first `futures` entry becomes:

```ts
      { image: "/assets/future-of-banking-card.png", image_alt: "Future of Banking in a Technocratic World", label: "Industry Name", title: "Future of Banking", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.", ...article("future-of-banking", "Banking is being rebuilt around technologies that did not exist when its current operating model was designed.") },
```

Apply the same treatment to all nine entries, using these slugs and leads:

| List | Title | Slug | Lead |
|---|---|---|---|
| futures | Future of Banking | `future-of-banking` | Banking is being rebuilt around technologies that did not exist when its current operating model was designed. |
| futures | Future of Governance | `future-of-governance` | Governance is slow by design, and the systems it governs are no longer slow. |
| futures | Future of Education | `future-of-education` | Education is being pulled apart by the same forces that are rebuilding the work it prepares people for. |
| loops | Aliasys Business Loop | `aliasys-business-loop` | An ICT infrastructure business whose growth depended on making its own complexity invisible. |
| loops | Aliapay Business Loop | `aliapay-business-loop` | A payments business that had to earn loyalty in a market where switching costs had collapsed. |
| loops | AliaLab Business Loop | `alialab-business-loop` | An education lab that treated every cohort as a test of its own operating model. |
| cultures | Technocratic Culture | `technocratic-culture` | A culture where technical judgement carries the same weight as commercial judgement. |
| cultures | Design Thinking Culture | `design-thinking-culture` | A culture that starts every problem in the room where the problem is felt. |
| cultures | Collaborative Agile Culture | `collaborative-agile-culture` | A culture that moves in short cycles without losing the thread between them. |

- [ ] **Step 3: Add heading, label, body and article to the 18 image cards**

Each entry in the six `cards` arrays currently reads
`{ title: "Business Game 1", image: "/assets/business-game-card.png" }`.
Each becomes, for example:

```ts
          { title: "Business Game 1", image: "/assets/business-game-card.png", heading: "Business Game 1", label: "Industry Name", body: "Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet, consevbi adis Dolor sit amet, consevbi adis elit, sed do eismod tempdl sit amet.", ...article("business-game-1", "A simulation that puts your leadership team inside the decisions before the market does.") },
```

Use the card's own title as `heading`, `slugify(title)` as the slug, and these leads:

| Cards | Lead |
|---|---|
| Business Game 1–3 | A simulation that puts your leadership team inside the decisions before the market does. |
| Strategic Role 1–3 | Roles defined by the future the business is moving toward, not the org chart it inherited. |
| Leadership model 1–3 | A leadership operating model drawn from your brand's DNA rather than from a framework. |
| Risk Setting 1–3 | Most businesses solve the wrong problem well. This is the work of choosing the right one. |
| Change Solving 1–3 | Solutions designed against the real constraints your organization already operates under. |
| Performance Testing 1–3 | Capability tested in the reality of your operating system, not in a deck. |

- [ ] **Step 4: Run the seed and verify**

```bash
npm run seed
```

Expected: completes without error.

Then verify every route resolves:

```bash
npx tsx -e '
import { PrismaClient } from "@prisma/client";
import { CARD_PAGE_SECTIONS, extractCards, cardSlug, duplicateSlugs } from "./lib/card-pages";
const prisma = new PrismaClient();
for (const s of CARD_PAGE_SECTIONS) {
  const row = await prisma.section.findUnique({ where: { key: s.sectionKey } });
  const cards = extractCards(s, JSON.parse(row.data));
  const dupes = duplicateSlugs(cards);
  console.log(s.segment, cards.map(cardSlug).join(","), dupes.length ? "DUPES:" + dupes : "");
}
await prisma.$disconnect();
'
```

Expected: nine lines, three slugs each, no `DUPES:`.

- [ ] **Step 5: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: seed article content for all 27 cards

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Article page components

**Files:**
- Create: `components/card-page/ArticleHeader.tsx`
- Create: `components/card-page/ArticleBody.tsx`
- Create: `components/card-page/ArticleFooter.tsx`

**Interfaces:**
- Consumes: `CardPageSection` from `lib/card-pages.ts`; `TileGrid` from `components/ThrivableBusiness.tsx`.
- Produces:
  - `ArticleHeader({ section, label, title, heroImage, heroAlt })`
  - `ArticleBody({ lead, sections, keyPoints })` where `sections: { heading: string; body: string }[]` and `keyPoints: { title: string; body: string }[]`
  - `ArticleFooter({ section, ctaHeading, ctaLabel, ctaHref, related })` where `related: { image: string; label: string; title: string; body: string; image_alt: string; href: string }[]`

All three are server components. None fetches data.

- [ ] **Step 1: Create ArticleHeader**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { CardPageSection } from "../../lib/card-pages";

export function ArticleHeader({
  section,
  label,
  title,
  heroImage,
  heroAlt,
}: {
  section: CardPageSection;
  label: string;
  title: string;
  heroImage: string;
  heroAlt: string;
}) {
  return (
    <header className="card-article-header">
      <nav className="card-article-crumbs" aria-label="Breadcrumb">
        <Link href="/">Aliaflow</Link>
        <span aria-hidden="true">/</span>
        <Link href={section.anchor}>{section.label}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{title}</span>
      </nav>
      <div className="card-article-title-band">
        <div>
          {label ? <p className="card-article-label">{label}</p> : null}
          <h1>{title}</h1>
        </div>
        <div className="card-article-mark" aria-hidden="true">
          <span>{section.number}</span>
        </div>
      </div>
      {heroImage ? (
        <div className="card-article-hero">
          <Image src={heroImage} alt={heroAlt} fill sizes="100vw" priority />
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Create ArticleBody**

```tsx
export function ArticleBody({
  lead,
  sections,
  keyPoints,
}: {
  lead: string;
  sections: { heading: string; body: string }[];
  keyPoints: { title: string; body: string }[];
}) {
  return (
    <>
      {lead ? <p className="card-article-lead">{lead}</p> : null}
      {sections.length > 0 ? (
        <div className="card-article-body">
          {sections.map((entry) => (
            <section key={entry.heading || entry.body.slice(0, 32)}>
              {entry.heading ? <h2>{entry.heading}</h2> : null}
              <p>{entry.body}</p>
            </section>
          ))}
        </div>
      ) : null}
      {keyPoints.length > 0 ? (
        <div className="card-article-points">
          {keyPoints.map((point, index) => (
            <article key={point.title || index}>
              <b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
```

- [ ] **Step 3: Create ArticleFooter**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { CardPageSection } from "../../lib/card-pages";

export type RelatedCard = {
  image: string;
  label: string;
  title: string;
  body: string;
  image_alt: string;
  href: string;
};

/**
 * A "composed" card image is a finished card design with its text baked in.
 * Cropping it to fill the frame would cut that text, so it is shown whole.
 */
function imageClass(cardArt: CardPageSection["cardArt"]) {
  return cardArt === "composed"
    ? "card-article-related-image card-article-related-image--contain"
    : "card-article-related-image";
}

export function ArticleFooter({
  section,
  ctaHeading,
  ctaLabel,
  ctaHref,
  related,
}: {
  section: CardPageSection;
  ctaHeading: string;
  ctaLabel: string;
  ctaHref: string;
  related: RelatedCard[];
}) {
  return (
    <>
      {ctaHeading || ctaLabel ? (
        <section className="card-article-cta">
          {ctaHeading ? <h2>{ctaHeading}</h2> : null}
          {ctaLabel ? <a className="card-article-cta-button" href={ctaHref || "#contact-us"}>{ctaLabel}</a> : null}
        </section>
      ) : null}
      {related.length > 0 ? (
        <section className="card-article-related" aria-labelledby="card-article-related-heading">
          <h2 id="card-article-related-heading">More in {section.label}</h2>
          <div className="card-article-related-grid">
            {related.map((card) => (
              <Link key={card.href} href={card.href} className="card-article-related-card">
                <div className={imageClass(section.cardArt)}>
                  {card.image ? <Image src={card.image} alt={card.image_alt} fill sizes="33vw" /> : null}
                </div>
                <div className="card-article-related-copy">
                  {card.label ? <small>{card.label}</small> : null}
                  <h3>{card.title}</h3>
                  {card.body ? <p>{card.body}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
```

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors from `components/card-page/`.

- [ ] **Step 5: Commit**

```bash
git add components/card-page
git commit -m "feat: add article page blocks

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: The route

**Files:**
- Create: `app/services/[section]/[slug]/page.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1 and 4; `getSection` from `lib/sections.ts`; `Footer` from `components/Footer.tsx`.
- Produces: the nine live routes.

- [ ] **Step 1: Write the route**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer, type FooterData } from "../../../../components/Footer";
import { ArticleBody } from "../../../../components/card-page/ArticleBody";
import { ArticleFooter, type RelatedCard } from "../../../../components/card-page/ArticleFooter";
import { ArticleHeader } from "../../../../components/card-page/ArticleHeader";
import {
  CARD_PAGE_SECTIONS,
  cardSlug,
  displayTitle,
  extractCards,
  findSection,
  heroImage,
  type RawCard,
} from "../../../../lib/card-pages";
import { getSection } from "../../../../lib/sections";

export const dynamic = "force-dynamic";

type Params = { section: string; slug: string };

function str(card: RawCard, key: string): string {
  const value = card[key];
  return typeof value === "string" ? value.trim() : "";
}

function rows(card: RawCard, key: string): Record<string, unknown>[] {
  const value = card[key];
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

/** Resolves a route to its card, or null when either half is unknown. */
async function resolve({ section: segment, slug }: Params) {
  const section = findSection(segment);
  if (!section) return null;
  const data = await getSection(section.sectionKey);
  if (!data) return null;
  const cards = extractCards(section, data);
  const card = cards.find((item) => cardSlug(item) === slug);
  if (!card) return null;
  return { section, data, cards, card };
}

export async function generateStaticParams(): Promise<Params[]> {
  const params: Params[] = [];
  for (const section of CARD_PAGE_SECTIONS) {
    const data = await getSection(section.sectionKey);
    if (!data) continue;
    for (const card of extractCards(section, data)) {
      params.push({ section: section.segment, slug: cardSlug(card) });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await resolve(await params);
  if (!resolved) return { title: "Not found" };
  const title = displayTitle(resolved.card);
  return {
    title: `${title} — ${resolved.section.label} | Aliaflow`,
    description: str(resolved.card, "lead") || str(resolved.card, "body"),
  };
}

export default async function CardArticlePage({ params }: { params: Promise<Params> }) {
  const resolved = await resolve(await params);
  if (!resolved) notFound();
  const { section, data, cards, card } = resolved;

  const title = displayTitle(card);
  const slug = cardSlug(card);
  const lead = str(card, "lead") || str(card, "body");

  const related: RelatedCard[] = cards
    .filter((item) => cardSlug(item) !== slug)
    .map((item) => ({
      image: str(item, "image"),
      label: str(item, "label"),
      title: displayTitle(item),
      body: str(item, "body"),
      image_alt: str(item, "image_alt") || str(item, "title"),
      href: `/services/${section.segment}/${cardSlug(item)}`,
    }));

  const footer = (await getSection("footer")) as FooterData | null;

  return (
    <main className={`card-article card-article--${section.theme}`}>
      <ArticleHeader
        section={section}
        label={str(card, "label")}
        title={title}
        heroImage={heroImage(card, data)}
        heroAlt={str(card, "hero_image_alt") || str(card, "image_alt") || title}
      />
      <ArticleBody
        lead={lead}
        sections={rows(card, "sections").map((entry) => ({
          heading: str(entry, "heading"),
          body: str(entry, "body"),
        }))}
        keyPoints={rows(card, "key_points").map((entry) => ({
          title: str(entry, "title"),
          body: str(entry, "body"),
        }))}
      />
      <ArticleFooter
        section={section}
        ctaHeading={str(card, "cta_heading")}
        ctaLabel={str(card, "cta_label")}
        ctaHref={str(card, "cta_href")}
        related={related}
      />
      {footer ? <Footer {...footer} /> : null}
    </main>
  );
}
```

Note the `resolve` helper returns null rather than throwing when a section
record is missing, so a public URL never surfaces a stack trace.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/services
git commit -m "feat: add card article route

A missing section record resolves to notFound rather than throwing, so a
public URL never surfaces a stack trace.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Article page styling

**Files:**
- Create: `app/card-page.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: the class names emitted by Tasks 4 and 5.
- Produces: light and dark article styling.

- [ ] **Step 1: Write the stylesheet**

Create `app/card-page.css`:

```css
/* Article pages behind each marketing card. The type scale, rules and the
   three-tone palette are the landing page's; only the body column's
   line-height departs from it, because the landing's 1.14-1.3 is set for
   three-line card blurbs and becomes hostile over several hundred words. */

.card-article { background: #fff; color: #333; }
.card-article--dark { background: #292929; color: #fff; }

.card-article-crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 104px 7% 0;
  font-size: 12px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #686868;
}
.card-article--dark .card-article-crumbs { color: #aaa; }
.card-article-crumbs a:hover { color: #292929; }
.card-article--dark .card-article-crumbs a:hover { color: #fff; }
.card-article-crumbs [aria-current="page"] { color: #292929; }
.card-article--dark .card-article-crumbs [aria-current="page"] { color: #fff; }

.card-article-title-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 54px 7% 70px;
}
.card-article-label {
  margin: 0 0 22px;
  font-size: 15px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #686868;
}
.card-article--dark .card-article-label { color: #d3d3d3; }
.card-article-title-band h1 {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(44px, 6vw, 92px);
  line-height: .9;
  font-weight: 800;
  letter-spacing: -.075em;
}
.card-article-mark {
  width: 175px;
  height: 175px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f1f1f1;
  color: #c0c0c0;
}
.card-article-mark span { font-size: 72px; font-weight: 800; }
.card-article--dark .card-article-mark { background: #474747; color: #f5f5f5; }

.card-article-hero {
  position: relative;
  height: 60svh;
  border-top: 3px solid #555;
  border-bottom: 3px solid #555;
  background: #f4f4f4;
}
.card-article-hero img { object-fit: cover; filter: grayscale(1); }

.card-article-lead {
  max-width: 900px;
  margin: 0;
  padding: 86px 7% 0;
  font-size: clamp(22px, 2.4vw, 31px);
  line-height: 1.16;
}

.card-article-body { padding: 64px 7% 96px; }
.card-article-body section { max-width: 680px; }
.card-article-body section + section { margin-top: 56px; }
.card-article-body h2 {
  margin: 0 0 20px;
  padding-top: 28px;
  border-top: 2px solid #555;
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -.05em;
}
.card-article-body p {
  margin: 0;
  font-size: 16px;
  line-height: 1.45;
  color: #555;
}
.card-article--dark .card-article-body p { color: #d3d3d3; }

.card-article-points {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 3px solid #555;
  border-bottom: 3px solid #555;
}
.card-article-points article {
  min-width: 0;
  padding: 44px 36px 52px;
  border-right: 2px solid #555;
}
.card-article-points article:last-child { border-right: 0; }
.card-article-points b {
  display: block;
  font-size: 88px;
  line-height: .7;
  letter-spacing: -.08em;
  color: #aaa;
}
.card-article-points h3 { margin: 34px 0 10px; font-size: 30px; letter-spacing: -.04em; }
.card-article-points p { margin: 0; font-size: 16px; line-height: 1.16; color: #686868; }
.card-article--dark .card-article-points p { color: #d3d3d3; }

.card-article-cta {
  padding: 110px 7%;
  background: #aaa;
  color: #292929;
  text-align: center;
}
.card-article-cta h2 {
  margin: 0 0 40px;
  font-size: clamp(38px, 5vw, 71px);
  line-height: .92;
  font-weight: 800;
  letter-spacing: -.07em;
}
.card-article-cta-button {
  display: inline-block;
  padding: 17px 34px;
  border: 1px solid #292929;
  background: #292929;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
}
.card-article-cta-button:hover { background: #555; border-color: #555; }

.card-article-related { padding: 96px 0 0; }
.card-article-related h2 {
  margin: 0;
  padding: 0 7% 38px;
  font-size: clamp(30px, 3.4vw, 50px);
  line-height: .95;
  letter-spacing: -.06em;
}
.card-article-related-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 3px solid #555;
  border-bottom: 3px solid #555;
}
.card-article-related-card {
  display: block;
  min-width: 0;
  border-right: 2px solid #555;
}
.card-article-related-card:last-child { border-right: 0; }
.card-article-related-image {
  position: relative;
  height: 275px;
  overflow: hidden;
  background: #f7f7f7;
}
.card-article-related-image img { object-fit: cover; transition: transform .4s ease; }
.card-article-related-copy { padding: 16px 28px 30px; border-top: 3px solid #555; }
.card-article-related-image--contain { background: #fff; }
.card-article-related-image--contain img { object-fit: contain; }
.card-article--dark .card-article-related-image--contain { background: #292929; }
.card-article-related-copy small { font-size: 12px; }
.card-article-related-copy h3 { margin: 22px 0 10px; font-size: 23px; line-height: .96; letter-spacing: -.045em; }
.card-article-related-copy p { margin: 0; font-size: 12px; line-height: 1.16; color: #555; }
.card-article--dark .card-article-related-copy p { color: #d3d3d3; }

@media (hover: hover) {
  .card-article-related-card:hover .card-article-related-image img { transform: scale(1.03); }
}
.card-article-related-card:focus-visible { outline: 3px solid #2557d6; outline-offset: -3px; }

@media (max-width: 780px) {
  .card-article-crumbs { padding-top: 84px; }
  .card-article-title-band { flex-direction: column; align-items: flex-start; gap: 34px; padding: 40px 10% 52px; }
  .card-article-title-band h1 { max-width: none; }
  .card-article-mark { width: 120px; height: 120px; }
  .card-article-mark span { font-size: 48px; }
  .card-article-hero { height: 46svh; }
  .card-article-lead { padding: 56px 10% 0; }
  .card-article-body { padding: 44px 10% 64px; }
  .card-article-points { grid-template-columns: 1fr; }
  .card-article-points article { border-right: 0; border-bottom: 2px solid #555; }
  .card-article-points article:last-child { border-bottom: 0; }
  .card-article-cta { padding: 72px 10%; }
  .card-article-related h2 { padding: 0 10% 28px; }
  .card-article-related-grid { grid-template-columns: 1fr; }
  .card-article-related-card { border-right: 0; border-bottom: 2px solid #555; }
  .card-article-related-card:last-child { border-bottom: 0; }
}
```

- [ ] **Step 2: Import it**

In `app/layout.tsx`, add `import "./card-page.css";` alongside the existing
stylesheet imports, as the last of them so it can override where needed.

- [ ] **Step 3: Verify in the browser**

Start the dev server and check `/services/future-of-x-book/future-of-banking`
(light) and `/services/business-game/business-game-1` (dark), at desktop width
and at 390px. Confirm: no horizontal scroll, the hero fills its band, key points
collapse to one column on mobile, and the dark page's body copy is legible.

- [ ] **Step 4: Commit**

```bash
git add app/card-page.css app/layout.tsx
git commit -m "feat: style card article pages

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Link the landing cards

**Files:**
- Modify: `components/ThrivableBusiness.tsx`
- Modify: `components/FutureImageCarousel.tsx`
- Modify: `components/FigmaSections.tsx`

**Interfaces:**
- Consumes: `cardSlug` from `lib/card-pages.ts`.
- Produces: clickable landing cards. `TileGrid` gains an optional `segment` prop;
  `FutureImage` gains an optional `href` and `duplicate` flag.

- [ ] **Step 1: Link TileGrid cards**

In `components/ThrivableBusiness.tsx`, import `Link from "next/link"` and
`cardSlug from "../lib/card-pages"`, then change `TileGrid` to:

```tsx
export type Tile = { image: string; label: string; title: string; body: string; image_alt: string; slug?: string; heading?: string };

export function TileGrid({ items, contain = false, segment }: { items: Tile[]; contain?: boolean; segment?: string }) {
  return (
    <CardRail className="future-grid">
      {items.map((item) => {
        const href = segment ? `/services/${segment}/${cardSlug(item)}` : undefined;
        const inner = (
          <>
            <div className={`future-map${contain ? " future-map-contain" : ""}`}>
              <Image src={item.image} alt={item.image_alt} fill sizes="33vw" />
            </div>
            <div className="future-card-copy">
              <small>{item.label}</small>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </>
        );
        /* Written as two branches rather than a dynamic tag: a `Link | "article"`
           union does not typecheck, because `href` is required on one arm. */
        return href ? (
          <Link key={item.title} className="future-card" href={href}>{inner}</Link>
        ) : (
          <article key={item.title} className="future-card">{inner}</article>
        );
      })}
    </CardRail>
  );
}
```

Then pass the segment at each call site in the same file:

```tsx
        <TileGrid items={futures} segment="future-of-x-book" />
```
```tsx
        <TileGrid items={loops} segment="critical-business-loop" />
```
```tsx
        <TileGrid items={cultures} segment="brand-culture-xp" />
```

Also widen the three list types on `ThrivableBusinessData` in the same file so an
authored slug is not dropped by the type. Replace each of these three lines:

```tsx
  futures: { image: string; label: string; title: string; body: string; image_alt: string }[];
  loops: { image: string; label: string; title: string; body: string; image_alt: string }[];
  cultures: { image: string; label: string; title: string; body: string; image_alt: string }[];
```

with:

```tsx
  futures: Tile[];
  loops: Tile[];
  cultures: Tile[];
```

- [ ] **Step 2: Link image carousel slides**

In `components/FutureImageCarousel.tsx`, extend the type and the slide:

```tsx
export type FutureImage = {
  /** CMS-provided URL for a fully designed card image. */
  src?: string;
  alt: string;
  /** Article this slide links to. Absent slides stay unlinked. */
  href?: string;
  /** Padding slides repeat an earlier card; hidden from assistive tech. */
  duplicate?: boolean;
};
```

```tsx
function CarouselSlide({ item, index, className }: { item: FutureImage; index: number; className: string }) {
  const body = item.src ? (
    <img src={item.src} alt={item.href ? "" : item.alt} draggable={false} />
  ) : (
    <div className="image-carousel-placeholder" role="img" aria-label={`${item.alt || "Image card"} has no image`}>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <strong>{item.alt || "Image not added"}</strong>
    </div>
  );

  if (item.duplicate) {
    return <article className={className} aria-hidden="true">{body}</article>;
  }
  if (item.href) {
    return (
      <article className={className}>
        <Link href={item.href} aria-label={item.alt}>{body}</Link>
      </article>
    );
  }
  return <article className={className}>{body}</article>;
}
```

Add `import Link from "next/link";` at the top.

When a slide is a link, the inner `img` gets `alt=""` because the link's
`aria-label` already carries the name; otherwise a screen reader announces the
same text twice.

- [ ] **Step 3: Pass hrefs and mark padding slides**

In `components/FigmaSections.tsx`, import `cardSlug` from `../lib/card-pages`
and change `ThreeCards` to accept a segment and a duplicate offset:

```tsx
export function ThreeCards({ items, dark = false, segment, realCount }: { items: Item[]; dark?: boolean; segment?: string; realCount?: number }) {
  const slides: FutureImage[] = items.map((item, index) => ({
    src: item.image?.trim() || undefined,
    alt: item.title,
    href: segment ? `/services/${segment}/${cardSlug(item)}` : undefined,
    duplicate: realCount !== undefined && index >= realCount,
  }));
  const isBusinessGame = items.every((item) => item.title.trim().toLowerCase().startsWith("business game"));
  const isChangeSolving = items.every((item) => item.title.trim().toLowerCase().startsWith("change solving"));
  const isRiskSetting = items.every((item) => item.title.trim().toLowerCase().startsWith("risk setting"));
  const isPerformanceTesting = items.every((item) => item.title.trim().toLowerCase().startsWith("performance testing"));
  return <ImageCarousel items={slides} dark={dark} label="Service examples" className={isBusinessGame ? "business-game-carousel" : isChangeSolving ? "change-solving-carousel" : isRiskSetting ? "risk-setting-carousel" : isPerformanceTesting ? "performance-testing-carousel" : undefined} />;
}
```

`Item` gains the fields `cardSlug` reads:

```tsx
type Item = { title: string; image?: string; text?: string; heading?: string; slug?: string };
```

In `BusinessLeadership`, replace the statement map body with:

```tsx
    {statements.map((statement) => {
      const normalized = statement.title.trim().toLowerCase();
      const segment = { "business game": "business-game", "strategic roles": "strategic-roles", "leadership model": "leadership-model" }[normalized];
      const pad = segment !== undefined;
      const cards = pad ? [...statement.cards, ...statement.cards.slice(0, 2)] : statement.cards;
      return <Fragment key={statement.number}>
        <ServiceStatement dark number={statement.number} title={statement.title} body={statement.body} />
        <ThreeCards dark segment={segment} realCount={statement.cards.length} items={cards} />
      </Fragment>;
    })}
```

In `TechnocraticDesign`, the same shape with:

```tsx
      const segment = { "change solving": "change-solving", "risk setting": "risk-setting", "performance testing": "performance-testing" }[normalized];
```
and `<ThreeCards segment={segment} realCount={statement.cards.length} items={cards} />`.

`StatementWithCards` gains the new card fields:

```tsx
type StatementWithCards = { number: string; title: string; body: string; cards: { title: string; image?: string; heading?: string; slug?: string }[] };
```

- [ ] **Step 4: Confirm the landing page is unchanged**

Run: `npx tsc --noEmit`
Expected: no errors.

Load `/` and compare against the screenshots in the design spec. Confirm the
card rails still show five slides, the cards look identical, and hovering a
card now scales its image slightly.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add components/ThrivableBusiness.tsx components/FutureImageCarousel.tsx components/FigmaSections.tsx
git commit -m "feat: link landing cards to their article pages

The two padding slides in each rail repeat the first two cards, so they are
marked aria-hidden and stay out of the tab order.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Card link styling

**Files:**
- Modify: `app/card-page.css`

- [ ] **Step 1: Add the landing hover affordance**

Append to `app/card-page.css`:

```css
/* Landing cards became links in Task 7. The image lift is the only hover
   affordance on the page; the frames already clip it. */
a.future-card { display: block; color: inherit; }
a.future-card .future-map img { transition: transform .4s ease; }
@media (hover: hover) {
  a.future-card:hover .future-map img { transform: scale(1.03); }
}
a.future-card:focus-visible,
.future-image-slide a:focus-visible,
.image-carousel-slide a:focus-visible { outline: 3px solid #2557d6; outline-offset: -3px; }

.future-image-slide a,
.image-carousel-slide a { display: block; }
.future-image-slide a img,
.image-carousel-slide a img { transition: transform .4s ease; }
@media (hover: hover) {
  .future-image-slide a:hover img,
  .image-carousel-slide a:hover img { transform: scale(1.03); }
}
```

- [ ] **Step 2: Verify**

Load `/`, hover a Future of X card and a Business Game slide. Confirm the image
lifts inside its frame without the card itself moving, and that tabbing reaches
three slides per rail rather than five.

- [ ] **Step 3: Commit**

```bash
git add app/card-page.css
git commit -m "feat: add hover and focus affordances to landing cards

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Verification

After Task 8, confirm all of the following before calling the work done:

- [ ] `npm test` passes.
- [ ] `npx tsc --noEmit` reports no errors.
- [ ] `npm run build` succeeds.
- [ ] All 27 routes return 200. Check a sample from each section.
- [ ] `/services/nope/nope` and `/services/future-of-x-book/nope` both return 404.
- [ ] The landing page renders identically to the screenshots in the spec.
- [ ] A dark article and a light article both read correctly at 1440px and 390px.
