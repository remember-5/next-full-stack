# Next Full Stack Template

Opinionated Next.js 16 full stack starter for internal teams: Better Auth, Prisma, tRPC, shadcn sidebar shell, admin and user roles, and reusable local quality gates.

## Prerequisites

- Node.js 20.9.0 or newer
- pnpm 10+
- Docker

## Quick Start

```bash
pnpm install
pnpm setup:local
docker compose up -d db
pnpm db:push
pnpm auth:init-admin
pnpm dev
```

## Default Accounts

- Admin email comes from `ADMIN_EMAIL`
- Admin password comes from `ADMIN_PASSWORD`

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
