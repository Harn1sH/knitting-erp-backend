---
name: schema-change
description: Change prisma/schema.prisma and prepare (but never apply) a migration, then hand off to the user. Use whenever a model, field, enum, or index must change.
disable-model-invocation: true
---

Schema change requested: $ARGUMENTS

The local `.env` DATABASE_URL points at PROD. Claude never applies migrations.

1. Read the relevant ADRs in `docs/adr/` and flag any conflict before editing.
2. Edit `prisma/schema.prisma`. Prefer additive changes (new nullable columns, new tables). For a required column on an existing table, add it nullable or with a `@default`, and note that a backfill is needed.
3. Run `npx prisma validate` and `npx prisma format`.
4. Ask the user before generating SQL, because `migrate dev --create-only` still connects to the DB to diff it. Once they approve: `npx prisma migrate dev --create-only --name <snake_case_description>`.
5. Read the generated `prisma/migrations/<ts>_<name>/migration.sql`. Point out anything destructive (DROP, column type changes, NOT NULL without default) and any data backfill required.
6. Run `npx prisma generate` and `npx tsc --noEmit`, then fix the services and DTOs that break.
7. Hand off: tell the user the exact command to apply (`npx prisma migrate deploy` against the intended DB) and remind them to check which `DATABASE_URL` is active in `.env`.
