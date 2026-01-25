# Build stage
FROM node:23-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for SSR (produces .output with Node server; do not use 'nuxt generate')
RUN npm run build

# Production stage – Node.js for SSR
FROM node:23-alpine

WORKDIR /app

# Copy built output (server + public assets)
COPY --from=builder /app/.output /app/.output

# Entrypoint maps NUXT_API_URL → NUXT_PUBLIC_API_BASE when only the legacy var is set
COPY .docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Run as non-root node user for security
RUN chown -R node:node /app

# At runtime: NUXT_PUBLIC_API_BASE (preferred) or NUXT_API_URL (legacy) = backend API URL
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

USER node

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
