# ============================================
# Stage 1: Install dependencies
# ============================================

FROM oven/bun:1 AS dependencies

WORKDIR /app

# Copy files needed for dependency installation and Prisma client generation
COPY package.json bun.lock* prisma.config.ts ./
COPY prisma ./prisma

# Install dependencies without running postinstall until the full source is available
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --no-save --frozen-lockfile --ignore-scripts

# ============================================
# Stage 2: Generate Prisma client without a live database
# ============================================

FROM dependencies AS prisma-client

# prisma generate validates config, but does not need a live database connection.
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/next-full-stack \
    bunx prisma generate --schema prisma/schema.prisma

# ============================================
# Stage 3: Build the Next.js application
# ============================================

FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
COPY --from=prisma-client /app/generated ./generated

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILD_STANDALONE=true
ENV SKIP_ENV_VALIDATION=1

# Build-time env vars use safe placeholders because runtime values arrive from Compose
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:5432/next-full-stack \
    BETTER_AUTH_SECRET=build-only-secret-build-only-secret \
    BETTER_AUTH_URL=http://build.local/api/auth \
    LOG_LEVEL=info \
    bun run build

# ============================================
# Stage 4: Migration runner
# ============================================

FROM oven/bun:1 AS migrator

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV LOG_LEVEL=info

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=prisma-client /app/generated ./generated
COPY package.json bun.lock* prisma.config.ts ./
COPY prisma ./prisma

CMD ["bun", "run", "db:migrate"]

# ============================================
# Stage 5: Production runner
# ============================================

FROM oven/bun:1 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV LOG_LEVEL=info

# Copy standalone output and static files
COPY --from=builder --chown=bun:bun /app/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/.next/static ./.next/static
COPY --from=builder --chown=bun:bun /app/public ./public
COPY --from=builder --chown=bun:bun /app/generated ./generated
COPY --chown=bun:bun docker/start.sh ./docker/start.sh

# Run as non-root user
USER bun

EXPOSE 3000

CMD ["./docker/start.sh"]
