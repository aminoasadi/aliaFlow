# Aliaflow single-user CMS — design spec

## Goal

Replace the hardcoded content in `work/aliaflow-nextjs` with a database-backed,
single-user CMS so every text string and image across every section of the
public site can be edited from an admin panel, without touching code. The
admin UI is built with shadcn/ui; the public site's existing visual design is
untouched.

## Decisions (confirmed with user)

- **Unified Next.js app**: one Next.js project serves the public site, the
  `/admin` panel, and the API routes. The existing `work/aliaflow-cms`
  NestJS service is left as-is and not used going forward.
- **Storage**: SQLite via Prisma. Chosen over Postgres for stability on a
  single Arvan Cloud VPS deployment — no separate DB service/Docker to run,
  trivial file-based backups. Prisma keeps a Postgres migration path open
  later if needed.
- **Images**: stored on local disk under `public/uploads/`, path recorded in
  the section's JSON content.
- **Auth**: single admin user, seeded (not self-service signup). Email +
  bcrypt password hash in DB, HTTP-only signed session cookie, no third
  party auth library needed given single user.
- **Content model**: schema-driven, not a bespoke form per section. Each
  section has a declared field schema (text / textarea / image / list-of-
  sub-fields); the admin renders one generic form generator from that
  schema. Section content itself is stored as a JSON blob per section key.

## Data model (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model Section {
  key       String   @id        // e.g. "hero", "outcomes", "business-leadership"
  data      String              // JSON-encoded content, shape defined by sections.schema.ts
  updatedAt DateTime @updatedAt
}
```

`Section.data` is opaque JSON at the DB layer; `lib/sections.schema.ts` is the
single source of truth for what fields each key contains, both for
generating the admin form and for typing the data the public site reads.

## Section inventory (initial schema + seed source)

Each entry: section key → fields → current hardcoded source file.

1. **header** — `wordmark: text`, `links: list<{ label: text }>` —
   `components/Header.tsx`
2. **hero** — `eyebrow: text`, `heading: text`, `image: image` —
   `components/Hero.tsx`
3. **outcomes** — `intro_heading: text`,
   `items: list<{ label: text, emphasis: text, copy: textarea, stats: list<{ value: text }> }>`,
   `manifesto_heading: text`, `manifesto_words: text` —
   `data/site.ts` (`outcomes`) + `components/OutcomeStack.tsx`
4. **service-catalogue-nav** — `heading: text`,
   `tabs: list<{ number: text, label: text }>` — `components/FigmaSections.tsx`
   (`ServiceCatalogueNav`)
5. **thrivable-business** — `heading: text`, `question_image: image`,
   `question: text`,
   `service_blocks: list<{ number: text, title: text, body: textarea }>`,
   `futures: list<{ title: text, heading: text, tags: textarea }>`,
   `loops: list<{ image: image, label: text, title: text }>`,
   `cultures: list<{ image: image, label: text, title: text }>`,
   `magazine_heading: text`, `magazine_price: text`, `magazine_image: image`,
   `jam_heading: text`, `jam_date: text`, `jam_body: textarea`, `jam_image: image`
   — `components/ThrivableBusiness.tsx`
6. **business-leadership** — `question: text`,
   `statements: list<{ number: text, title: text, body: textarea }>`,
   `cards: list<{ title: text, image: image }>` (grouped per statement),
   `holocratic_line: text`, `event_title: text`, `event_image: image` —
   `components/FigmaSections.tsx` (`BusinessLeadership`)
7. **technocratic-design** — `question: text`, `pillars: list<{ label: text }>`,
   `statements: list<{ number: text, title: text, body: textarea }>`,
   `cards: list<{ title: text, image: image }>`, `event_title: text`,
   `event_image: image` — `components/FigmaSections.tsx` (`TechnocraticDesign`)
8. **execution-management** — `heading: text`,
   `orbit_labels: list<{ label: text, emphasis: boolean }>`, `body: textarea`
   — `components/FigmaSections.tsx` (`ExecutionManagement`)
9. **why-choose-us** — `eyebrow: text`, `heading: text`,
   `points: list<{ label: text, body: textarea }>` —
   `components/FigmaSections.tsx` (`WhyChooseUs`)
10. **portfolio-people** — `timeline: list<{ year: text, label: text }>`,
    `people: list<{ name: text, role: text, image: image }>`,
    `toolkits: list<{ title: text, body: textarea }>` —
    `components/FigmaSections.tsx` (`PortfolioAndPeople`)
11. **testimonials-footer** — `partners: list<{ name: text }>`,
    `testimonials: list<{ name: text, role: text, title: text, body: textarea }>`,
    `closing_heading: text`, `closing_body: text` —
    `components/FigmaSections.tsx` (`TestimonialsAndFooter`)
12. **project-loop** — `eyebrow: text`, `heading: text`, `body: textarea`,
    `projects: list<{ name: text, subtitle: text, image: image }>` —
    `data/site.ts` (`projects`) + `components/ProjectLoop.tsx`
13. **trust-team** — `eyebrow: text`, `heading: text`,
    `pillars: list<{ label: text, body: textarea }>`,
    `team_heading: text`,
    `team: list<{ name: text, role: text, image: image }>` —
    `components/TrustSection.tsx`
14. **footer** — `eyebrow: text`, `heading: text`, `email: text`,
    `description: text`, `social_links: list<{ label: text, href: text }>`,
    `copyright: text` — `components/Footer.tsx`

Seed script populates all 14 rows with the exact current copy/images so the
public site is visually identical on first deploy.

## Public site wiring

Page/components switch from importing static data to reading it server-side:
`app/(site)/page.tsx` calls a `getSection(key)` helper (direct Prisma read,
this is a server component) for each section and passes the JSON down as
props — same prop shapes components already accept, so component internals
mostly don't change, only where their data comes from.

## Admin panel

- `/admin/login` — email + password form (shadcn `Form`, `Input`, `Button`),
  posts to `app/api/auth/login`.
- `/admin` — redirects to first section.
- `/admin/sections/[key]` — generic form generated from
  `sections.schema.ts[key]`:
  - `text` → shadcn `Input`
  - `textarea` → shadcn `Textarea`
  - `image` → current image preview + file input → uploads to
    `/api/media`, replaces stored path
  - `list<...>` → repeatable card block per item, with add / remove /
    reorder (move up/down buttons), each item rendering its own sub-fields
  - Save button PATCHes `/api/sections/[key]`, shows a shadcn `Sonner`/
    `Toast` on success or failure.
- `middleware.ts` protects `/admin/*` (except `/admin/login`) and mutating
  `/api/sections/*` + `/api/media` requests, redirecting unauthenticated
  requests to login.

## Error handling

- Login: invalid credentials → inline form error, no session cookie set.
- Section PATCH: server validates payload against the section's schema
  (required fields, list item shape) before writing; malformed payload
  returns 400 with a field-level message surfaced in the form.
- Media upload: reject non-image mime types and files over a size cap
  (5MB) with a clear error toast; accepted files are renamed to a random
  filename to avoid collisions/path traversal.
- Unauthenticated API access → 401, admin UI redirects to `/admin/login`.

## Testing

- Prisma-backed unit tests (or a test DB file) for the sections service:
  seed → read → update → read-back for at least one scalar and one list
  section.
- Auth: login success/failure, protected route rejection without session.
- Manual verification: run `next dev`, log in, edit one field per section
  type (text, textarea, image, list), confirm the public page reflects the
  change after reload.

## Out of scope

- Multi-user roles/permissions.
- Rich WYSIWYG editing (textarea is plain text/line breaks only, matching
  current content which has no inline formatting).
- Editing layout/structure/styling — only content values, not markup or
  CSS.
- Migrating or touching `work/aliaflow-cms` (NestJS).
