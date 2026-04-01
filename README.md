# Next Full Stack Template

An internal full-stack starter built on top of Next.js for shipping authenticated web apps with a consistent engineering baseline.

It comes with routing, authentication, database access, API plumbing, UI primitives, and day-to-day developer tooling already wired together so new projects can start from product work instead of setup work.

## What Is Included

- Next.js App Router with React and TypeScript
- Better Auth for authentication
- Prisma for database access and schema management
- tRPC for typed server-to-client APIs
- Pino for structured server-side logging
- Tailwind CSS and shadcn-style UI primitives
- TanStack Query and TanStack Form for client state and forms
- ESLint, Prettier, Husky, lint-staged, commitlint, and cz-git for code quality and commit workflow

## Quick Start

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

3. Fill in the required environment variables in `.env`.

4. Push the Prisma schema to your local database and generate the Prisma client:

   ```bash
   bun run db:push
   ```

5. Start the development server:

   ```bash
   bun run dev
   ```

6. Open `http://localhost:3000`.

## Environment Variables

The repository includes `.env.example` as the source of truth for required local variables.

Current variables:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma
- `BETTER_AUTH_SECRET`: signing secret used by Better Auth
- `BETTER_AUTH_GITHUB_CLIENT_ID`: GitHub OAuth client id for Better Auth
- `BETTER_AUTH_GITHUB_CLIENT_SECRET`: GitHub OAuth client secret for Better Auth
- `LOG_LEVEL`: server log verbosity for the shared Pino logger, for example `info` or `debug`

If you add a new environment variable, update `.env.example` at the same time.

## Common Commands

### App

- `bun run dev` - start the development server
- `bun run build` - create a production build
- `bun run start` - run the production server
- `bun run preview` - build and immediately start the app

### Code Quality

- `bun run check` - run ESLint and TypeScript checks
- `bun run lint` - run ESLint only
- `bun run lint:fix` - run ESLint with autofix
- `bun run typecheck` - run TypeScript only
- `bun run format:check` - check formatting with Prettier
- `bun run format:write` - format files with Prettier

### Database

- `bun run db:push` - push the current Prisma schema to the database and regenerate the client
- `bun run db:generate` - regenerate the Prisma client from the current schema
- `bun run db:migrate` - apply deploy-time Prisma migrations
- `bun run db:studio` - open Prisma Studio

### Git Helpers

- `bun run commit` - open the interactive `cz-git` commit prompt
- `bun run commit:all` - stage all changes, then open the interactive commit prompt
- `bun run commitlint` - validate a commit message manually
- `bun run prepare` - reinstall local Git hooks if needed

## Project Layout

The project follows a feature-oriented structure on top of the Next.js App Router.

- `src/app` - route segments, layouts, pages, and route handlers
- `src/components` - shared UI building blocks and layout components
- `src/features` - feature modules such as auth, notifications, products, and users
- `src/server` - auth, database, and server-side API setup
- `src/lib` - shared utilities and client helpers
- `src/config` - navigation, table, and UI configuration
- `prisma` - Prisma schema and database configuration

## Database Workflow

This template uses Prisma with PostgreSQL by default.

Recommended local workflow:

1. Make sure `DATABASE_URL` points to a reachable local or remote PostgreSQL instance.
2. Use `bun run db:push` while iterating quickly on schema changes in local development.
3. Use `bun run db:generate` if you only need to refresh the generated Prisma client.
4. Use `bun run db:migrate` in deployment environments that apply managed migration history.
5. Use `bun run db:studio` to inspect records during development.

If you need a temporary database for short-lived local testing, this repository has also been used with:

```bash
bunx --bun create-db --ttl 24h --env .env
```

## Authentication Notes

Authentication is powered by Better Auth and exposed through the Next.js app under `src/app/api/auth/[...all]/route.ts`.

The current template includes:

- email and password authentication
- Better Auth client and server helpers under `src/server/better-auth`
- protected dashboard routing patterns in `src/app/dashboard`

If you change auth providers, flows, or callback behavior, update both the implementation and this README so setup instructions stay accurate.

## Commit Workflow

This repository uses `husky`, `lint-staged`, `commitlint`, and `cz-git` to keep commits consistent and catch issues before they are recorded.

Daily workflow:

1. Stage the changes you want to commit, or run `bun run commit:all`.
2. Run `bun run commit`.
3. Confirm the generated Conventional Commit message.
4. Let the hooks run automatically.

What runs automatically:

- `pre-commit` runs `lint-staged` on staged files only
- `commit-msg` runs `commitlint` on the final commit message

Commit message guidance:

- Use Conventional Commit types such as `feat`, `fix`, `docs`, `refactor`, and `chore`
- Scope is optional, but useful for modules such as `app`, `auth`, `api`, `db`, `ui`, `config`, `deps`, and `ci`
- Keep the subject short, imperative, and without a trailing period

## Deployment Notes

Choose a deployment target based on the application requirements. For most internal apps, a standard Next.js deployment flow on Vercel or Docker-based infrastructure is a reasonable default.

Server logs are emitted through Pino. In development they are pretty-printed for readability, and in production they are written as structured JSON to standard output so Docker can collect them directly.

Before release, verify that:

- production environment variables are configured
- `LOG_LEVEL` is set appropriately for the target environment, usually `info` in production
- database connectivity is available from the target runtime
- Better Auth callback and base URL settings match the deployed domain
- Prisma migrations or schema sync strategy are aligned with the environment
