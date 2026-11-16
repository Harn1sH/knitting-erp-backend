---
name: new-endpoint
description: Add a new REST endpoint (or new Nest module) following this repo's controller → service → Prisma pattern, central DTOs, auth guards, and a service spec. Use when adding or changing routes in src/.
---

Add the endpoint described in: $ARGUMENTS

1. Read `CONTEXT.md` and any ADR in `docs/adr/` touching this domain. Use glossary terms in names.
2. **DTO** in `src/dto/<areaCamelCase>/` (e.g. `src/dto/yarnInwards/`). Every property needs a class-validator decorator — the global `whitelist: true` pipe strips undecorated fields silently. Use `@Type(() => X)` + `@ValidateNested({ each: true })` for nested arrays.
3. **Controller** in `src/<module>/<module>.controller.ts`: thin, delegates to the service. Apply `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(...)` (from `src/auth/jwt.guard.ts`, `src/auth/roles/`). If the controller lacks guards entirely, add them at class level.
4. **Service**: inject `PrismaService`. Wrap multi-table writes in `this.prisma.$transaction(...)`. Stock changes are ledger inserts (`YarnStockLedger`), never updates. Throw Nest HTTP exceptions (`BadRequestException`, `NotFoundException`) for business-rule failures.
5. New module? Register it in `src/app.module.ts` and import `PrismaModule`.
6. **Spec**: `src/<module>/<module>.service.spec.ts` with a mocked `PrismaService` (`{ provide: PrismaService, useValue: mock }`). Cover the business rule and its failure path. Run `npx jest src/<module>`.
7. If the schema must change, stop and use `/schema-change` — don't run migrations.
8. Verify: `npx tsc --noEmit`, `npx jest src/<module>`, `npx eslint <changed files>`.
