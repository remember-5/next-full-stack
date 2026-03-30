# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 16 App Router project with T3-style server modules. `src/app` holds routes, layouts, and route handlers such as `src/app/api/**`. Keep route-local UI in `src/app/_components`. Put shared server code in `src/server` (`api`, `better-auth`, `db.ts`) and tRPC helpers in `src/trpc`. Global styles live in `src/styles`. Database schema lives in `prisma/schema.prisma`, and the generated Prisma client is emitted to `generated/prisma`. Static assets belong in `public/`.

## Build, Test, and Development Commands
- `pnpm dev`: run the app locally with Turbopack.
- `pnpm dev:test`: run the Playwright-targeted app server on port `3001` with `.env.test`.
- `pnpm build`: create a production build.
- `pnpm preview` or `pnpm start`: serve the built app.
- `pnpm lint` / `pnpm lint:fix`: run ESLint and apply safe fixes.
- `pnpm typecheck`: run TypeScript without emitting files.
- `pnpm check`: run the main pre-PR gate (`next lint && tsc --noEmit`).
- `pnpm test` / `pnpm test:unit`: run the Vitest suite.
- `pnpm test:unit:watch`: run Vitest in watch mode.
- `pnpm test:e2e`: run Playwright end-to-end tests.
- `pnpm test:e2e:ui`: open Playwright UI mode.
- `pnpm test:e2e:install`: install the Chromium browser used by Playwright.
- `pnpm format:check` / `pnpm format:write`: run Prettier with Tailwind class sorting.
- `pnpm db:push`: sync `prisma/schema.prisma` to a local database.
- `pnpm db:push:test`: sync the schema to the Playwright test schema from `.env.test`.
- `pnpm db:generate`: create and apply a development migration.
- `pnpm db:migrate`: deploy existing migrations.
- `pnpm db:studio`: inspect local data with Prisma Studio.
- `pnpm auth:init-admin:test`: seed or refresh the Playwright admin account from `.env.test`.

## Coding Style & Naming Conventions
Use TypeScript/TSX, 2-space indentation, semicolons, and double quotes to match the current code. Prefer `~/` imports over deep relative paths. Use PascalCase for React components (`LatestPost`), camelCase for functions and variables, and lowercase route segment folders under `src/app`. Keep server-only logic inside `src/server`, and update `src/env.js` whenever environment variables change.

## Testing Guidelines
Use `Vitest` for unit and non-browser integration tests, `React Testing Library` for client component tests, and `Playwright` for browser E2E. `pnpm test` runs the Vitest suite, while `pnpm verify` runs `check`, `test`, `test:e2e`, and `build`.

Playwright requires a local `.env.test` copied from `.env.test.example` plus a running Docker PostgreSQL container. It automatically starts a Next.js server on port `3001`, runs `pnpm db:push:test`, and runs `pnpm auth:init-admin:test` before browser tests. `.env.test` shares the same PostgreSQL service as local development but uses the `e2e` schema to avoid polluting development data. `BETTER_AUTH_SECRET` in `.env.test` can remain blank for local non-production testing.

For normal local development, the startup flow remains:

```bash
pnpm install
pnpm setup:local
docker compose up -d db
pnpm db:push
pnpm auth:init-admin
pnpm dev
```

## Commit & Pull Request Guidelines
The current history starts with a Conventional Commit (`feat: init`); keep using that format, for example `fix: handle missing auth callback`. Keep commits focused and imperative. Preserve a linear git history by default: prefer fast-forward merges, or rebase then fast-forward when needed. Do not create merge commits with `--no-ff` unless the user explicitly asks for them. PRs should include a short summary, linked issue when applicable, screenshots for UI changes, manual verification steps, and notes for schema or env updates. If you add a config key, update `.env.example` in the same PR and avoid committing secrets in `.env`.


## Codex SubAgent Rules
By default, all spawn_agents use gpt-5.4 and high.
Unless the user explicitly requests otherwise, do not use gpt-5.1-codex-mini or any other lower-quality models.
If no special model is required, it is preferable not to explicitly pass model/reasoning_effort, allowing the sub-agent to inherit the default configuration of the main session, where all spawn_agents use gpt-5.4 and high.
All subagents must execute from a git worktree under `.worktrees/<task-name>` inside this repository.
Before spawning a subagent, create or reuse an appropriate worktree under `.worktrees/` and use that worktree as the subagent's working directory.
