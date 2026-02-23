FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci

# Build Nuxt SSR output.
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

# Runtime only: Nitro server bundle and static assets.
COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
