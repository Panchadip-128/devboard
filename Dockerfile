FROM node:20-alpine AS base

# Install OpenSSL for Prisma and build tools for worker threads
RUN apk add --no-cache openssl python3 make g++

# 1. Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build Next.js (Next.js requires the client during build for type checking)
RUN npx prisma generate
RUN npm run build

# 3. Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
# Copy the custom tsc build output for workers if it exists
COPY --from=builder /app/dist ./dist

# Create the startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'npx prisma db push --accept-data-loss' >> /app/start.sh && \
    echo 'npx prisma db seed' >> /app/start.sh && \
    echo 'npm run start' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]
