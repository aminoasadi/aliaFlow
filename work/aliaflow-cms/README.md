# Aliaflow CMS

NestJS content API for the Aliaflow landing site.

## Local development

1. `docker compose up -d` — starts Postgres.
2. `cp .env.example .env` and adjust `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`JWT_SECRET`.
3. `npm install`
4. `npm run seed` — creates the admin user and initial section content.
5. `npm run start:dev` — API on `http://localhost:4000/api`, Swagger docs on `http://localhost:4000/docs`.

## Manual verification

```bash
# Public read
curl http://localhost:4000/api/sections/hero

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aliaflow.com","password":"change-me-please"}'
# => { "accessToken": "..." }

# Authenticated update (replace TOKEN)
curl -X PATCH http://localhost:4000/api/sections/hero \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"data":{"eyebrow":"A L I A F L O W","heading":"NEW HEADLINE","image":"/assets/boardroom.png"}}'

# Upload an image (replace TOKEN and the file path)
curl -X POST http://localhost:4000/api/media \
  -H 'Authorization: Bearer TOKEN' \
  -F 'file=@/path/to/image.png'
```

## Tests

`npm test` — Jest unit tests for the users, auth, sections, and media services (mocked repositories, no live DB required).
