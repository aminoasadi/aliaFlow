# Aliaflow CMS — Design Spec

Date: 2026-09-06

## Purpose

The `aliaflow-nextjs` landing site currently hardcodes all copy and structured
content (hero text, footer, nav links, outcome/service/leadership/design
cards, team members, testimonials, partners, portfolio, etc.) directly in
`data/site.ts` and inside component files. This project adds a CMS so that
content can be edited without touching code or redeploying the site.

## Scope

- A NestJS backend (`aliaflow-cms`) exposing a content API, auth, and image
  uploads.
- A Next.js + shadcn/ui admin dashboard (`aliaflow-admin`) for logging in and
  editing content and media.
- Wiring `aliaflow-nextjs` to read section content from the CMS's public API
  instead of the static `data/site.ts` file. (Layout/design of the landing
  page itself is unchanged — only the data source moves.)

Out of scope: multi-user roles/permissions (single admin account only),
content versioning/approval workflows, non-image media types.

## Architecture

Three sibling projects under `work/`:

- `work/aliaflow-cms` — NestJS API, Postgres via TypeORM, runs on port 4000.
- `work/aliaflow-admin` — Next.js + shadcn/ui dashboard, runs on port 4001,
  talks only to the CMS API.
- `work/aliaflow-nextjs` — existing landing site; `data/site.ts` equivalents
  become `fetch()` calls against `GET /sections` / `GET /sections/:key`.

Local Postgres runs via `docker-compose.yml` in `aliaflow-cms` (single
`postgres` service + named volume, exposed on 5432).

## Data model

### `Section`

Flexible content model — one entity for every section on the page, since
shapes vary too much for per-type tables (hero copy vs. team-member arrays
vs. testimonial lists).

| field       | type      | notes                                             |
|-------------|-----------|----------------------------------------------------|
| `id`        | uuid (PK) |                                                    |
| `key`       | string, unique | slug e.g. `hero`, `footer`, `nav-links`, `outcomes`, `service-cards`, `leadership-cards`, `design-cards`, `projects`, `trust`, `testimonials`, `partners` |
| `label`     | string    | human-readable name shown in admin UI              |
| `data`      | jsonb     | arbitrary structure for that section                |
| `updatedAt` | timestamp |                                                    |
| `updatedBy` | string, nullable | email of the admin who last saved it        |

Seeded at first boot from the current contents of `data/site.ts` and the
hardcoded component copy, so the site keeps working immediately after cutover.

### `Media`

| field       | type      | notes                    |
|-------------|-----------|--------------------------|
| `id`        | uuid (PK) |                          |
| `filename`  | string    | stored filename on disk  |
| `url`       | string    | public URL (`/media/...`)|
| `mimetype`  | string    |                          |
| `size`      | int       | bytes                    |
| `createdAt` | timestamp |                          |

Files are stored on local disk under a volume-mounted `uploads/` directory,
served statically by NestJS. (No cloud storage in this pass — swappable
later behind the same `Media` interface.)

### `User`

| field          | type      | notes                          |
|----------------|-----------|--------------------------------|
| `id`           | uuid (PK) |                                |
| `email`        | string, unique |                           |
| `passwordHash` | string    | bcrypt                        |

No public registration endpoint. The single admin account is created by a
seed script driven by `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars, run once
against the target database.

## API

All endpoints under `/api` prefix, documented via Swagger at `/docs`.

- `POST /api/auth/login` — `{ email, password }` → `{ accessToken }` (JWT,
  passport-local for credential check, passport-jwt for guarding routes).
- `GET /api/sections` — public. Returns all sections as `{ key, label, data,
  updatedAt }[]`.
- `GET /api/sections/:key` — public. One section, 404 if missing.
- `PATCH /api/sections/:key` — JWT-guarded. Body: `{ data: object }`,
  validated with a DTO (`data` must be a plain object). Replaces the
  section's `data` and stamps `updatedBy`/`updatedAt`.
- `POST /api/media` — JWT-guarded. `multipart/form-data`, single `file`
  field, multer disk storage, image mimetypes only, 5MB limit. Returns the
  created `Media` record.
- `GET /api/media` — JWT-guarded. Lists media, newest first.
- `DELETE /api/media/:id` — JWT-guarded. Deletes the DB record and the file
  on disk.

Global middleware: `helmet()`, `morgan('combined')`, a global
`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`, and CORS
restricted to the admin app's origin.

## Auth flow

- Admin app login form → Next.js route handler (`/api/login` in the admin
  app) → calls CMS `POST /api/auth/login` → on success, sets the JWT as an
  **httpOnly, secure, sameSite=lax** cookie on the admin app's own domain.
  The token never reaches client-side JS.
- Next.js `middleware.ts` checks for that cookie on any `/dashboard/*`
  route and redirects to `/login` if absent. (This checks presence only;
  the CMS still verifies the JWT signature/expiry on every API call.)
- Server components / route handlers in the admin app forward the cookie's
  token as `Authorization: Bearer <token>` when calling the CMS API.
- Logout clears the cookie.

## Admin app (Next.js + shadcn/ui)

- `/login` — email/password form (shadcn `Form`, `Input`, `Button`).
- `/dashboard` — table/card list of sections (`key`, `label`, `updatedAt`)
  linking into an editor.
- `/dashboard/sections/[key]` — form editor generated from the section's
  current `data` shape:
  - scalar fields (strings) → `Input`/`Textarea`.
  - arrays of objects (team members, testimonials, cards, partners) →
    repeatable field groups with add/remove (shadcn primitives + a small
    array-field helper), each item's fields introspected the same way.
  - any shape the generator can't confidently render falls back to a raw
    JSON `Textarea` editor (still validated as JSON before submit).
  - image-valued fields get a "choose from media library" picker alongside
    manual URL entry.
- `/dashboard/media` — grid of uploaded images (shadcn `Dialog` for
  upload/drag-drop), delete action, click-to-copy URL.

## Cutover in `aliaflow-nextjs`

- Replace the static exports in `data/site.ts` with an async function that
  `fetch()`s `GET /sections/:key` (or all of `/sections` once) from the CMS,
  with `data/site.ts`'s current literals kept as a fallback constant used
  only if the fetch fails (so the site never goes fully blank if the CMS is
  down).
- Components that currently import hardcoded literals (`Hero`, `Footer`,
  `Header`'s nav links, `TrustSection`'s team array, etc.) instead receive
  that data as props from the page/server component that fetched it.
- `CMS_API_URL` becomes an env var in `aliaflow-nextjs`.

## Error handling

- CMS: NestJS's built-in exception filters + a thin global filter to shape
  error responses as `{ statusCode, message }`; 404 for unknown section
  keys/media ids, 401/403 via passport-jwt guards, 400 via ValidationPipe
  for bad DTOs.
- Admin app: form-level error messages from failed API calls (toast via
  shadcn), login page shows an inline error on 401.
- Landing site: fetch failures fall back to the last-known static content
  (see Cutover above) rather than breaking the page.

## Testing

- CMS: Jest unit tests for `AuthService` (login success/failure),
  `SectionsService` (get/patch, not-found case), `MediaService`
  (create/list/delete, rejects non-image mimetypes). Uses NestJS's testing
  module with an in-memory/test Postgres schema.
- No automated E2E for the admin UI in this pass; verified manually
  (login → edit a section → save → confirm via `GET /sections/:key`) as
  part of implementation.

## Open items deferred (explicitly out of scope for now)

- Multiple admin roles / permissions.
- Content revision history or publish/draft workflow.
- Cloud storage for media (S3-compatible) — current disk storage is
  swappable later.
