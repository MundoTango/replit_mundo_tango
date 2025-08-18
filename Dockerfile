# ESA LIFE CEO 61x21 - Optimized Multi-Stage Docker Build
# ---------- Stage 1: build ----------
FROM node:20-slim AS builder
WORKDIR /app
ENV CI=true

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libvips-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application - client build -> dist/public and server build -> dist/index.js
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies for sharp
RUN apt-get update && apt-get install -y \
    libvips42 \
    && rm -rf /var/lib/apt/lists/*

# Only bring the minimal runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# If you serve static from node, keep your existing start script
EXPOSE 5000
CMD ["node", "dist/index.js"]