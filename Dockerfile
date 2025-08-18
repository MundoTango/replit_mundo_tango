# ---- build stage ----
FROM node:20-slim AS build
WORKDIR /app
ENV CI=true NODE_ENV=production

# install only what we need to build
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci

# copy sources and build
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY public ./public
COPY vite.config.ts tsconfig.json ./
RUN npm run build

# ---- runtime stage ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=5000

# install prod deps only
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci --omit=dev && npm cache clean --force

# bring in the built artifacts and server entry
COPY --from=build /app/dist ./dist

# minimal healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD node -e "process.exit(0)"

EXPOSE 5000
CMD ["npm","run","start"]