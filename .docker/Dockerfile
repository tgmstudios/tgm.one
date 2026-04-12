# Build stage
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

WORKDIR /app

# Copy lockfile and package.json first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build for SSR (produces .output with Node server)
RUN pnpm run build

# Production stage – Node.js for SSR
FROM node:22-alpine

WORKDIR /app

# Copy built output (server + public assets)
COPY --from=builder /app/.output /app/.output

# Entrypoint maps NUXT_API_URL → NUXT_PUBLIC_API_BASE when only the legacy var is set
COPY .docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Run as non-root node user for security
RUN chown -R node:node /app

ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

USER node

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
