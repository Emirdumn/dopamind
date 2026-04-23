# syntax=docker/dockerfile:1.7

# ── ArabaIQ Next.js frontend — production image ─────────────────────────
# Three-stage build:
#   deps    → install only package manager metadata (cached layer)
#   builder → compile the app (`next build`) with NEXT_PUBLIC_* baked in
#   runner  → tiny runtime, runs `node server.js` from the standalone bundle
#
# `next.config.mjs` sets `output: 'standalone'`, which emits a self-contained
# `.next/standalone` folder — we copy only that into the runner.

# ── 1. deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# libc6-compat keeps some native deps (like sharp) happy on alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# ── 2. builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* must be available at BUILD time because they're inlined
# into the static bundle. Pass them via --build-arg in docker compose.
ARG NEXT_PUBLIC_ARABAIQ_API_URL=https://arabaiq.com/api/v1
ENV NEXT_PUBLIC_ARABAIQ_API_URL=$NEXT_PUBLIC_ARABAIQ_API_URL

# Server-only env (OTOAPI_KEY etc.) is read at request time, not build time,
# so we don't bake it into the image.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── 3. runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run as an unprivileged user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Static assets (public/*) and the compiled server are copied from the
# builder stage. `next.config.mjs` output=standalone already packages
# node_modules in .next/standalone so we don't need `node_modules` here.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
