
# ESA LIFE CEO 61x21 - Ultra-optimized multi-stage Dockerfile

# ---- dependencies stage ----
FROM node:20-alpine AS deps
WORKDIR /app
# Use alpine for smaller base image
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# Clean install with cache mount for faster builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Copy dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy only essential source files
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY public ./public
COPY vite.config.ts tsconfig.json ./
COPY attached_assets ./attached_assets

# Build with production optimizations
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build && \
    # Remove source files after build
    rm -rf client server shared && \
    # Clean npm cache
    npm cache clean --force

# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package.json ./

# Set production environment
ENV NODE_ENV=production
ENV PORT=80

# Use non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:80/healthz', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

EXPOSE 80

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
