# ---- build stage ----
FROM node:20-slim AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=5000

# Install only prod deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Bring in built assets only
COPY --from=builder /app/dist ./dist

# Healthcheck (adjust if you expose a health route)
# HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "process.exit(0)"

EXPOSE 5000
CMD ["node", "dist/index.js"]