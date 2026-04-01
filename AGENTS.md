# AGENTS.md

This file is for coding agents working in `/Users/wangjiahao/Github/remember5/next-full-stack`.

## Purpose

- Treat this repository as a Bun-first Next.js full-stack template.
- Prefer small, targeted edits that preserve the existing structure and patterns.
- Verify changes with the lightest relevant checks before finishing.

## Stack Overview

- Runtime/package manager: Bun (`bun.lock` is present).
- App framework: Next.js 16 App Router.
- Language: TypeScript with `strict: true`, `noUncheckedIndexedAccess: true`, and `verbatimModuleSyntax: true`.
- Styling: Tailwind CSS v4, `tw-animate-css`, and `prettier-plugin-tailwindcss`.
- Data/auth: Prisma, PostgreSQL, Better Auth, tRPC.
- Client state/forms: TanStack Query and TanStack Form.
- Quality gates: ESLint flat config, Prettier, Husky, lint-staged, commitlint, cz-git.

## Repository Layout

- `src/app`: Next.js route segments, layouts, pages, route handlers, error boundaries.
- `src/components`: shared UI and layout components.
- `src/features`: feature-oriented modules such as products, users, forms, overview, notifications.
- `src/server`: auth setup, Prisma client, tRPC server code.
- `src/lib`: framework-agnostic helpers and utility functions.
- `src/config`: configuration objects for navigation, tables, and UI.
- `src/types`: shared TypeScript types.
- `prisma`: Prisma schema.
- `generated/prisma`: generated Prisma client output; do not hand-edit.

## Install And Setup

- Install dependencies with `bun install`.
- Copy envs with `cp .env.example .env`.
- Required envs are defined in `src/env.js` and documented in `.env.example`.
- Main required variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_GITHUB_CLIENT_ID`, `BETTER_AUTH_GITHUB_CLIENT_SECRET`.
- Regenerate/push Prisma schema during local setup with `bun run db:push`.

## Primary Commands

- `bun run dev`: start local development server.
- `bun run build`: create a production build.
- `bun run start`: run the production server.
- `bun run preview`: build and immediately start.
- `bun run check`: run ESLint and TypeScript (`eslint . && tsc --noEmit`).
- `bun run lint`: run ESLint.
- `bun run lint:fix`: run ESLint with autofix.
- `bun run typecheck`: run TypeScript only.
- `bun run format:check`: check Prettier formatting.
- `bun run format:write`: write Prettier formatting.
- `bun run db:generate`: regenerate Prisma client.
- `bun run db:push`: push schema and regenerate Prisma client.
- `bun run db:migrate`: apply deploy-time Prisma migrations.
- `bun run db:studio`: open Prisma Studio.

## Test Status

- There is currently no dedicated test runner configured in `package.json`.
- No Vitest, Jest, Playwright, or Cypress config files are present.
- No `*.test.*` or `*.spec.*` files were found in the repository.
- Do not invent `bun run test` commands in automation unless you also add the test setup.

## Single-Test Guidance

- There is no current single-test command because no test framework is installed.
- For targeted verification today, use the smallest relevant command instead:
- `bun run lint path/to/file.tsx` is not configured; ESLint runs on `.` only, so use `bunx eslint path/to/file.tsx` if you need a single-file lint check.
- `bunx tsc --noEmit` is repo-wide only; there is no single-file typecheck workflow configured.
- If you add a test runner, update this file with exact commands for running one file and one test case.

## Recommended Verification Order

- For small UI or logic edits: run `bun run check`.
- For formatting-sensitive edits: run `bun run format:check` or `bun run format:write`.
- For Prisma/schema changes: run `bun run db:generate` or `bun run db:push` as needed.
- For build-risky changes: run `bun run build`.

## Git Hooks And Commit Workflow

- Pre-commit hook: `.husky/pre-commit` runs `bunx lint-staged` on staged files.
- Commit-msg hook: `.husky/commit-msg` runs `bunx commitlint --edit "$1"`.
- Lint-staged behavior from `package.json`:
- `*.{js,jsx,ts,tsx}` -> `bunx eslint --fix`
- `*.{js,jsx,ts,tsx,md,mdx,json,css,scss}` -> `bunx prettier --write`
- Commit helper commands:
- `bun run commit`
- `bun run commit:all`
- `bun run commitlint`

## Commit Message Rules

- Conventional Commit types are enforced.
- Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Scope is optional.
- Preferred scopes listed in `commitlint.config.mjs`: `app`, `auth`, `api`, `db`, `ui`, `config`, `deps`, `ci`.
- Subject must be imperative, non-empty, lower-case type, no trailing period, max header length 100.

## Cursor/Copilot Rules

- No `.cursorrules` file exists.
- No files were found under `.cursor/rules/`.
- No `.github/copilot-instructions.md` file exists.
- That means the repo-specific guidance for agents currently comes from source/config patterns and this file.

## Import Conventions

- Follow existing alias usage:
- Use `@/` for most imports from `src`, for example `@/components/ui/button`.
- `~/` is also configured and is used heavily in server/tRPC/env code, for example `~/server/db` and `~/env`.
- Prefer `import type` for type-only imports; ESLint warns on this and the codebase uses it widely.
- Keep imports grouped cleanly; Prettier handles formatting, but preserve readable ordering.
- Avoid deep relative paths when an alias is available.

## Formatting Conventions

- Prettier is the formatting authority.
- Tailwind class ordering is handled by `prettier-plugin-tailwindcss`.
- Use double quotes and semicolons, matching the existing codebase.
- Keep JSX readable; the codebase accepts multiline props and multiline object literals freely.
- Do not hand-sort Tailwind classes against plugin output.

## TypeScript Conventions

- Preserve strict typing; avoid `any` unless there is no practical alternative.
- Prefer inferred return types for simple functions, explicit types for public APIs and complex values.
- Use `type` aliases heavily; `interface` is also used for component props and extension patterns.
- Reuse domain types from nearby `types.ts` or schema files before introducing new ones.
- When importing types, prefer inline `type` imports, e.g. `import { cva, type VariantProps } from "class-variance-authority"`.
- Respect non-nullability; if you must assert, keep the assertion local and justified.

## Naming Conventions

- Components: PascalCase.
- Hooks: `useX`.
- Utility functions: camelCase, descriptive, usually verb-first.
- Constants: `UPPER_SNAKE_CASE` for true constants, otherwise camelCase objects like `productKeys` or `dataTableConfig`.
- Files: kebab-case for most modules, matching the existing structure.
- Query key factories use plural resource names and nested helpers, e.g. `productKeys.all/list/detail`.

## React And Next.js Conventions

- Add `"use client"` only for components/hooks that truly require client execution.
- Default to server components in `src/app` when client interactivity is not needed.
- Keep providers centralized in layout/provider files.
- Follow existing App Router patterns for `page.tsx`, `layout.tsx`, `error.tsx`, and `not-found.tsx`.
- Preserve current theme, navigation, and provider composition when editing layout code.

## Data And API Conventions

- Feature modules often separate `service.ts`, `queries.ts`, `mutations.ts`, `types.ts`, and `schemas/*`.
- `service.ts` is the data-access seam; the products/users examples explicitly document this pattern.
- TanStack Query options are wrapped in helper factories like `productsQueryOptions`.
- Keep tRPC router changes wired through `src/server/api/root.ts`.
- Do not hand-edit generated Prisma client files.

## Error Handling Conventions

- Throw explicit `Error` or `TRPCError` objects for real failure states.
- Keep thrown messages specific and actionable.
- Use local `try/catch` only when recovering, transforming, or intentionally swallowing errors.
- Silent catches are rare; if one is needed, keep it narrow like the existing theme-color bootstrap script.
- In UI mutations, prefer user-facing feedback via `toast.success` / `toast.error` where that pattern already exists.

## Editing Guidelines For Agents

- Make minimal edits that fit the surrounding style.
- Preserve comments that explain architectural seams or integration points.
- Avoid broad refactors unless the task requires them.
- Update docs when setup, envs, commands, auth flow, or database workflow changes.
- If you add tests/tooling later, update this file with exact commands immediately.

## Safe Defaults Before Finishing

- Run at least `bun run check` after non-trivial code changes.
- Run `bun run format:write` if formatting drift is likely.
- Run `bun run build` for routing, env, Prisma, auth, or other integration-heavy changes.
- Mention any commands you could not run and why.
