# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

NestJS 11 + Prisma 7 (`@prisma/adapter-pg` driver adapter, Postgres). Frontend is a separate app (Vite, `localhost:5173` / Netlify) and **generates all PDFs** — "PDF changes" here mean reshaping JSON responses (mostly `jobcard.service.ts`).

## Database — never run migrations

- The local `.env` `DATABASE_URL` points at **PROD**. Never run `prisma migrate dev|deploy|reset`, `prisma db push`, or `prisma db execute`. A PreToolUse hook blocks these.
- Allowed: edit `prisma/schema.prisma`, `npx prisma migrate dev --create-only --name <x>` (writes SQL, doesn't apply — still touches the DB to diff, so ask first), `npx prisma generate`, `npx prisma validate`. The user applies migrations.
- Standalone scripts (`backfill-clients.ts`, `.scratch/*.ts`) must replicate the `PrismaPg` adapter setup from `src/prisma/prisma.service.ts`; a bare `new PrismaClient()` won't work.

## Code layout & conventions

- One module folder per domain in `src/` with only `*.module.ts`, `*.controller.ts`, `*.service.ts`. Services call `PrismaService` directly (no repository layer).
- DTOs live centrally in `src/dto/<area>/`, **not** in module folders. Folder names are camelCase (`dto/yarnInwards`), unlike module folders (`yarn-inwards`).
- Global `ValidationPipe` uses `whitelist: true`: any DTO property without a class-validator decorator is **silently stripped**. Decorate every field.
- Auth: JWT is read from the `token` cookie, not a Bearer header. Protect routes with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` (`src/auth/jwt.guard.ts`, `src/auth/roles/`). The stock, delivery, yarn-inwards, and yarn-returns controllers currently lack guards — that's a bug; add guards to any endpoint you create or touch there.
- New service logic gets a colocated `*.spec.ts` (jest, `rootDir=src`). Run one: `npx jest src/path/file.spec.ts`. `test/app.e2e-spec.ts` boots the full app against a real DB — don't run it.

## Domain invariants (see `CONTEXT.md` glossary and `docs/adr/`)

- Yarn stock is an append-only ledger (`YarnStockLedger` STOCK_IN/STOCK_OUT); balance = ΣIN − ΣOUT. Never mutate `YarnInwardItem` to change stock.
- `JobCard.clientId` is the authoritative client FK; `customerName` is display-only.
- A Delivery Challan requires produced − delivered > 0, enforced inside the DeliveryService transaction.
- Use glossary terms: "Job Card" (not order/ticket), "Yarn Inward Challan" (not GRN).

## Formatting & lint

- Prettier: single quotes, trailing commas. Much existing code predates this; a repo-wide `npm run format` is fine but do it as its own commit, separate from logic changes.
- `npm run lint` runs `eslint --fix` (rewrites files).
- `npx tsc --noEmit` for a type check without the slow `nest build`.

## Git

- Work on a feature branch (`feat/<slug>`, `fix/<slug>`), never commit directly to `main`; open a PR with `gh`.
- Conventional commits: `feat(jobcard): ...`, `fix(delivery): ...` — scope is the module name.
