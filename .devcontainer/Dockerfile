# Development image for Nuxt with SSR
# `nuxt dev` runs in SSR mode when ssr: true in nuxt.config
FROM node:23-bullseye

WORKDIR /app
ENV NODE_ENV=development
ENV HOST=0.0.0.0

# Better file watching in containers
RUN apt-get update && apt-get install -y \
    inotify-tools \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

# Nuxt dev server: SSR + HMR, bind to all interfaces for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
