# ==============================================================================
# ROBÔ LED PARTNER — DIGITAL MARKETING PLATFORM
# Multi-stage Production Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: Build Frontend SPA
# ------------------------------------------------------------------------------
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 2: Build Backend Node/TS & Prisma Client
# ------------------------------------------------------------------------------
FROM node:20-alpine AS server-builder
WORKDIR /app/server

COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci
RUN npx prisma generate

COPY server/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# STAGE 3: Production Runtime Image
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV PUBLIC_DIR=/app/public
ENV UPLOAD_DIR=/app/uploads

RUN apk add --no-cache openssl curl dumb-init

# Create non-root system user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Install production dependencies & generate Prisma client
COPY --chown=nodejs:nodejs server/package*.json ./
COPY --chown=nodejs:nodejs server/prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copy compiled backend & frontend distribution
COPY --chown=nodejs:nodejs --from=server-builder /app/server/dist ./dist
COPY --chown=nodejs:nodejs --from=client-builder /app/client/dist ./public

# Create upload directory with proper permissions
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

USER nodejs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
