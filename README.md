# Next Full Stack Template

This repository is an internal full-stack template built on top of Next.js. It is intended to provide a practical starting point for new projects with a consistent engineering baseline, including TypeScript, linting, formatting, database tooling, and commit workflow automation.

## Included Stack

- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Prisma](https://www.prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Better Auth](https://www.better-auth.com)

## Getting Started

1. Install dependencies with `bun install`.
2. Copy environment variables from `.env.example` if needed.
3. Start the development server with `bun run dev`.

## Common Commands

- Start development: `bun run dev`
- Build for production: `bun run build`
- Start the production server: `bun run start`
- Run lint and type checks: `bun run check`
- Run lint only: `bun run lint`
- Run type check only: `bun run typecheck`
- Format files: `bun run format:write`

## Database Setup

This template uses Prisma for database access and schema management.

1. Make sure your database connection is configured in `.env`.
2. Generate or sync the schema with `bun run db:push` during early local development.
3. Open Prisma Studio with `bun run db:studio` to inspect local data.
4. Use `bun run db:migrate` for deploy-time migrations when your project starts using managed migration history.

### Database Commands

- Push the current schema to the database: `bun run db:push`
- Create a development migration: `bun run db:generate`
- Apply deploy migrations: `bun run db:migrate`
- Open Prisma Studio: `bun run db:studio`

## Commit Workflow

This template uses `husky`, `commitlint`, `cz-git`, and `lint-staged` to keep commits consistent and catch issues before they are recorded.

### Daily Usage

1. Stage selected changes with `git add`, or run `bun run commit:all` to stage all changes automatically.
2. Run `bun run commit` to open the interactive `cz-git` prompt for the changes already staged.
3. Confirm the generated commit message and let the hooks run automatically.

### What Runs Automatically

- `pre-commit`: runs `lint-staged` on staged files only
- `commit-msg`: runs `commitlint` to validate the final commit message

### Commit Message Rules

- Use Conventional Commits such as `feat`, `fix`, `docs`, `refactor`, and `chore`
- Scope is optional, but recommended for template modules such as `app`, `auth`, `api`, `db`, `ui`, `config`, `deps`, and `ci`
- Keep the subject short, imperative, and without a trailing period

### Manual Commands

- Run the interactive commit helper: `bun run commit`
- Stage all changes and run the interactive commit helper: `bun run commit:all`
- Check a commit message manually: `bun run commitlint`
- Reinstall hooks after dependency install if needed: `bun run prepare`

## Deployment

Choose a deployment target based on your project requirements. For most internal web applications, a standard Next.js deployment flow on platforms such as Vercel or Docker-based infrastructure is a good default. Make sure environment variables, database access, and authentication callbacks are configured for the target environment before release.
