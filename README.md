# Next Full Stack Template

Opinionated Next.js 16 full stack starter for internal teams: Better Auth, Prisma, tRPC, shadcn sidebar shell, admin and user roles, and reusable local quality gates.

## Prerequisites

- Node.js 20.9.0 or newer
- pnpm 10+
- Docker

## Quick Start

Development startup is unchanged:

```bash
pnpm install
pnpm setup:local
docker compose up -d db
pnpm db:push
pnpm auth:init-admin
pnpm dev
```

`pnpm setup:local` creates `.env` from `.env.example` when needed and fills `BETTER_AUTH_SECRET` for local development.

## Default Accounts

- Admin email comes from `ADMIN_EMAIL`
- Admin password comes from `ADMIN_PASSWORD`

## Testing

### Test Stack

- `Vitest` for unit and non-browser integration tests
- `React Testing Library` for client component tests
- `Playwright` for end-to-end browser flows

### Test Commands

```bash
pnpm test
pnpm test:unit
pnpm test:unit:watch
pnpm test:e2e
pnpm test:e2e:ui
pnpm verify
```

### Playwright Setup

First-time local E2E setup:

```bash
cp .env.test.example .env.test
pnpm test:e2e:install
docker compose up -d db
```

Then run:

```bash
pnpm test:e2e
```

Playwright automatically:

- starts a test Next.js server on port `3001`
- runs `pnpm db:push:test`
- runs `pnpm auth:init-admin:test`
- executes the browser tests

Playwright does not automatically:

- create `.env.test`
- start Docker for PostgreSQL

### `.env` vs `.env.test`

- `.env` is for normal development on `http://localhost:3000`
- `.env.test` is for Playwright on `http://localhost:3001`
- both can use the same PostgreSQL container
- `.env.test` uses the `e2e` schema so browser tests do not pollute development data
- `BETTER_AUTH_SECRET` in `.env.test` can be left blank for local non-production testing

If `.env.test` already exists, you usually only need to keep Docker running and execute `pnpm test:e2e`.

## Quality Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm verify
pnpm build
```

## Template Scope

- Next.js 16 App Router
- Better Auth email/password auth
- Admin and user route separation
- Prisma + PostgreSQL
- tRPC server/client wiring
- shadcn sidebar + breadcrumb shell
