# Aliaflow CMS — real shadcn/ui upgrade + Dashboard + Media Library

## Goal

Replace the hand-rolled UI primitives in the admin CMS (`work/aliaflow-nextjs/components/ui/*`,
built in the original CMS project as simplified Tailwind stand-ins) with real
shadcn/ui components, add a proper Dashboard landing page and a Media Library
page, and fix the underlying image-storage bug this surfaces.

## Decisions (confirmed with user)

- **Real shadcn/ui components**, New York style, light theme only (no dark
  mode toggle). Fetched via the shadcn component registry and adapted into
  this project — not the hand-rolled `components/ui/*` from the original
  build.
- **Theme palette**: shadcn's "Clean Slate" preset (slate neutrals, indigo
  primary) — a clean, professional, recognizably-shadcn look, applied as CSS
  variables scoped to `/admin` only (same isolation strategy as before:
  `corePlugins.preflight: false`, `admin.css` never imported from the public
  render path).
- **Path alias**: add `"@/*": ["./*"]` to `tsconfig.json` so new admin/shadcn
  files use the standard shadcn import convention (`@/components/ui/button`,
  `@/lib/utils`). Existing public-site files keep their relative imports
  untouched — this is purely additive and changes nothing about how they
  resolve.
- **Form engine unchanged**: `DynamicSectionForm`'s recursive state-based
  field editor stays as-is (react-hook-form + a static zod schema doesn't fit
  a fully dynamic, arbitrarily-nested schema well, and the current engine is
  already tested and working). Only the visual primitives it renders
  (`Button`, `Input`, `Textarea`, `Label`, `Card`) are swapped for the real
  shadcn versions.
- **Dashboard** (`/admin`, replacing today's redirect-to-first-section): a
  landing page showing a welcome header and a card grid of all 12 sections,
  each showing its label and last-updated time, plus a link to the Media
  Library.
- **Media Library** (`/admin/media`): one standalone page with an image grid
  of every uploaded file (filename, preview, delete button). Deleting is
  blocked (button disabled with an explanatory tooltip) while the file's
  path is still referenced by any section. No "pick from library" integration
  inside per-field upload — that stays as direct upload only, per the
  approved design.
- **Upload storage fix** (prerequisite for the Media Library to make sense,
  and the Critical bug flagged in the prior whole-branch review): move
  uploaded files out of `public/uploads/` — which Next.js snapshots at build
  time, so anything uploaded after a production build 404s until the server
  restarts — into a private `storage/uploads/` directory, served through a
  route handler (`app/uploads/[...path]/route.ts`) that streams the file
  from disk with a content-type derived from its extension. The public URL
  shape stays `/uploads/<file>`, so no existing `<Image>`/`<img src>` usage
  anywhere in the codebase needs to change.
- **Upload extension fix** (Important finding from the same review): the
  media upload route currently derives the saved file's extension from the
  client-supplied filename, which is spoofable (a `.png`-typed upload named
  `x.html` gets saved as `x.html` and served as live HTML from the site's
  origin). Fix: derive the extension from the already-validated MIME type via
  a fixed allowlist map, ignore the client's filename entirely.

## Component inventory to add

Fetched from the shadcn registry (New York style) and placed under
`work/aliaflow-nextjs/components/ui/`, replacing the existing hand-rolled
files of the same name:

`button`, `input`, `textarea`, `label`, `card` (replace existing) — plus new:
`sidebar` (pulls in `sheet`, `tooltip`, `skeleton`, `separator`, and a
`use-mobile` hook), `dialog`, `alert-dialog`, `sonner`, `badge`, `avatar`,
`dropdown-menu`, `breadcrumb`.

Registry source is Tailwind v4-flavored (`w-(--sidebar-width)` parenthesis
arbitrary-value syntax, the unified `radix-ui` package import). Since this
project pins Tailwind v3 (deliberately — see the original CMS design spec),
every ported file needs two mechanical conversions applied consistently:
1. Parenthesis arbitrary-value syntax `X-(--foo)` → bracket syntax
   `X-[--foo]` (Tailwind v3's arbitrary-value form).
2. `import { X } from "radix-ui"` → the same, after adding the `radix-ui`
   npm package as a dependency (it is published standalone and provides the
   same named exports in both syntaxes — only the arbitrary-value CSS
   classes above need changing, not this import).

## Theme wiring

`app/admin/admin.css` gets a `:root` block (scoped to admin because the file
itself is only ever imported from admin pages, per the existing isolation
strategy) defining the "Clean Slate" light palette as CSS custom properties
(`--background`, `--foreground`, `--card`, `--primary`, `--secondary`,
`--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`,
`--radius`, `--sidebar*`, exact hex values below). `tailwind.config.ts`
extends `theme.colors` to map each shadcn token name (`background`,
`foreground`, `primary`, `primary-foreground`, etc.) to `var(--token)`, plus
`borderRadius` values derived from `--radius`. This is the standard
pre-v4 shadcn/Tailwind wiring.

Exact values (light only, from the shadcn "Clean Slate" preset):
background `#f8fafc`, foreground `#1e293b`, card `#ffffff`, primary
`#6366f1`/`#ffffff`, secondary `#e5e7eb`/`#374151`, muted
`#f3f4f6`/`#6b7280`, accent `#e0e7ff`/`#374151`, destructive
`#ef4444`/`#ffffff`, border/input `#d1d5db`, ring `#6366f1`, sidebar
`#f3f4f6`, sidebar-primary `#6366f1`/`#ffffff`, sidebar-accent
`#e0e7ff`/`#374151`, sidebar-border `#d1d5db`, radius `0.5rem`.

## File structure

```
work/aliaflow-nextjs/
  tsconfig.json                          (+ "@/*" path alias)
  tailwind.config.ts                     (+ shadcn color/radius tokens)
  app/admin/admin.css                    (+ CSS variables)
  lib/utils.ts                           (unchanged: cn() helper, now also reachable as @/lib/utils)
  components/ui/
    button.tsx, input.tsx, textarea.tsx, label.tsx, card.tsx   (replaced)
    sidebar.tsx, sheet.tsx, tooltip.tsx, skeleton.tsx, separator.tsx  (new)
    dialog.tsx, alert-dialog.tsx, sonner.tsx, badge.tsx, avatar.tsx,
    dropdown-menu.tsx, breadcrumb.tsx                          (new)
  hooks/use-mobile.ts                    (new, shadcn sidebar dependency)
  components/admin/
    AppSidebar.tsx                       (new: the actual sidebar content — nav groups, user footer)
    DynamicSectionForm.tsx               (modified: swap primitives, same logic)
    LogoutButton.tsx                     (modified: real Button/DropdownMenu)
  app/admin/(dashboard)/
    layout.tsx                           (modified: SidebarProvider + AppSidebar + SidebarInset)
    page.tsx                             (rewritten: Dashboard, not a redirect)
    media/page.tsx                       (new: Media Library page)
    sections/[key]/page.tsx              (unchanged logic, restyled via DynamicSectionForm)
  app/api/media/
    route.ts                             (modified: write to storage/uploads, mime-derived extension)
    [filename]/route.ts                  (new: DELETE, blocked if referenced by any section)
  app/uploads/[...path]/route.ts         (new: streams files from storage/uploads/)
  storage/uploads/                       (new, gitignored — replaces public/uploads/)
  lib/sections.ts                        (+ listSectionsMeta() for the Dashboard)
  lib/media.ts                           (new: listUploadedFiles(), isFileReferenced(path))
```

`public/uploads/` is removed entirely (any leftover empty directory deleted);
`.gitignore` updates `prisma/dev.db` / `public/uploads` entries to
`storage/uploads`.

## Data flow

- **Dashboard**: `app/admin/(dashboard)/page.tsx` is now a server component
  that calls `listSectionsMeta()` (new function in `lib/sections.ts`,
  `prisma.section.findMany({ select: { key: true, updatedAt: true } })`
  joined against `sectionSchemas` for labels) and renders one `Card` per
  section with a "last edited: <relative time>" line and an edit link.
- **Media Library**: `app/admin/(dashboard)/media/page.tsx` calls
  `listUploadedFiles()` (new, in `lib/media.ts`: reads `storage/uploads/`
  directory entries) and, for each file, `isFileReferenced("/uploads/x")`
  (new, in the same file: `JSON.stringify`-scans all 12 sections' stored
  JSON for the path string — simple substring search, good enough at this
  scale) to decide whether its delete button is enabled. The page itself is
  a server component; the delete button is a small client component that
  calls `DELETE /api/media/[filename]`.
- **Upload route**: unchanged request/response shape (`POST` multipart
  `file` → `{ path: "/uploads/<uuid>.<ext>" }`), only the write destination
  and extension-derivation logic change.
- **Serving route**: `GET /uploads/[...path]` reads the requested file from
  `storage/uploads/` (rejecting any path containing `..` before touching the
  filesystem) and returns it with `Content-Type` set from a fixed
  extension→MIME map, `Cache-Control: public, max-age=31536000, immutable`
  (filenames are random UUIDs, so this is always safe to cache hard).

## Error handling

- Serving route: unknown/missing file → 404. Path-traversal attempt (`..` in
  the path segments) → 400 before any filesystem access.
- Delete route: file still referenced by a section → 409 with a message
  naming which section(s) use it; missing file → 404; unauthenticated → 401
  (covered by the existing middleware matcher, extended to
  `/api/media/:path*`, which it already covers).
- Dashboard/Media Library pages: both are plain server components reading
  already-validated local data (DB rows, directory listing) — no new user
  input to validate here beyond what the existing API routes already
  validate.

## Testing

- No new automated tests for this pass: the changed surface is almost
  entirely visual (component swap) or thin I/O (serving/deleting files),
  consistent with how the rest of the admin UI was verified in the original
  build — manual verification through the running dev server (login,
  navigate the new Dashboard, open Media Library, confirm delete is blocked
  for an in-use image and allowed for an orphaned one, confirm an image
  survives a production `next build && next start` cycle instead of 404ing).
- `npx tsc --noEmit` and the existing `npm test` (validator/schema/auth
  suites, untouched by this work) must stay green throughout.

## Out of scope

- Dark mode / theme toggle.
- "Pick from library" media picker inside per-field image upload (stays
  direct-upload-only).
- Undo/version history, scheduled/staged edits, preview-before-save.
- Multi-user roles, admin password change from the UI.
- Migrating the DynamicSectionForm engine to react-hook-form/zod.
