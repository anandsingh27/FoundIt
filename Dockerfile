# syntax=docker/dockerfile:1

# ---- deps & build ----
FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# A dummy secret so `next build` (which loads .env) doesn't fail if no .env
# is present at build time; the REAL secret is provided at container runtime.
ENV SESSION_SECRET=build-time-placeholder-not-used-at-runtime
RUN npm run build

# ---- runtime ----
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_DIR=/app/data

# Standalone server + its pruned node_modules, plus static assets and
# uploads (public/) that `npm run build`'s postbuild step already copied in.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/scripts ./scripts

# Persisted at runtime via the /app/data and /app/public/uploads volumes.
RUN mkdir -p /app/data /app/public/uploads

EXPOSE 3000
VOLUME ["/app/data", "/app/public/uploads"]

CMD ["node", "server.js"]
