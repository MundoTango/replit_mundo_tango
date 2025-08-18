
# --- build stage ---
FROM node:20-slim AS build
WORKDIR /app

# only files needed to install & build
COPY package.json package-lock.json* ./
RUN npm ci

# copy rest of the source
COPY . .

# build client + server
RUN npm run build

# prune dev deps; keep prod only for runtime
RUN npm ci --omit=dev

# --- runtime stage ---
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=5000

# copy prod node_modules and built artifacts only
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# health check endpoint is served by the app at /health if you have one
EXPOSE 5000
CMD ["node", "dist/index.js"]
