# ─── Stage 1: builder — full workspace install + build ─────────────────────
# Build context = monorepo root (the API depends on packages/validation + packages/permission).
FROM node:22-alpine AS builder
WORKDIR /app

# Copy workspace manifests first so `npm ci` is cached when only source changes.
COPY package.json package-lock.json ./
COPY packages/validation/package.json ./packages/validation/
COPY packages/permission/package.json ./packages/permission/
COPY apps/api/package.json ./apps/api/
# When new apps/packages join the workspace, copy their package.json here too.
RUN npm ci

# Build-time ENV — prisma.config.ts resolves env('DATABASE_URL') eagerly,
# so the arg must merely EXIST for `prisma generate` (it never connects).
# The real URL is injected at runtime by compose.
ARG DATABASE_URL
ARG VERSION
ENV DATABASE_URL=$DATABASE_URL
ENV VERSION=$VERSION

# Full source, then: generate Prisma client → build the shared package → build the API.
COPY packages ./packages
COPY apps/api ./apps/api
RUN cd apps/api && npx prisma generate
RUN npm run build --workspace=packages/validation \
 && npm run build --workspace=packages/permission \
 && npm run build --workspace=apps/api

# ─── Stage 2: deps — production-only node_modules ──────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/validation/package.json ./packages/validation/
COPY packages/permission/package.json ./packages/permission/
COPY apps/api/package.json ./apps/api/
RUN npm ci --omit=dev

# ─── Stage 3: production ───────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# netcat: start.sh waits for the db port before running prisma.
RUN apk add --no-cache netcat-openbsd

# Root manifest (workspace context) + prod node_modules (holds the @vinaup-platform/* symlink).
COPY package.json package-lock.json ./
COPY --from=deps    /app/node_modules ./node_modules
# Built shared packages (dist) — the symlink targets of @vinaup-platform/validation + /permission.
COPY --from=builder /app/packages ./packages

# The API: built output + manifest + Prisma schema/config + entrypoint.
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/src/prisma/schema.prisma ./apps/api/src/prisma/schema.prisma
COPY apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY apps/api/start.sh ./apps/api/start.sh
RUN chmod +x ./apps/api/start.sh

WORKDIR /app/apps/api
EXPOSE 8000
CMD ["sh", "./start.sh"]
