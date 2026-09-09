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
Admin panel: `http://localhost:3000/admin` (log in with `ADMIN_EMAIL`/`ADMIN_PASSWORD` from `.env`) — a Dashboard shows every section with its last-edited time, a Media Library at `/admin/media` lists every uploaded image and lets you delete ones no longer referenced by any section, and the sidebar lists every editable section.

## Content model

Every editable section is a row in the `Section` table (`prisma/schema.prisma`), storing
a JSON blob whose shape is declared in `lib/sections.schema.ts`. The admin panel has one
generic form component (`components/admin/DynamicSectionForm.tsx`) that renders a form
for any section purely from that schema — adding a new editable field means editing
`lib/sections.schema.ts`, not building a new form.

Uploaded images are stored under `storage/uploads/` (not `public/`, which Next.js
snapshots at build time) and served through `app/uploads/[...path]/route.ts` — on
a real deployment, `storage/uploads/` needs the same persistent-volume treatment
`prisma/dev.db` does (see the deployment note below).

## Tests

```bash
npm test
```

Covers the schema validator (`lib/section-validation.ts`), the section schema
definitions (`lib/sections.schema.ts`), and the auth helpers (`lib/auth.ts`).
API routes and the admin UI are verified manually — see the plan at
`docs/superpowers/plans/2026-09-07-aliaflow-cms.md` for the exact `curl` and
browser steps.
