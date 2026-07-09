FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry is disabled by default via an env variable, but we can also set it here
ENV NEXT_TELEMETRY_DISABLED 1

# Generate prisma client
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files in case they are needed for running migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Install Prisma globally so we can run db push
RUN npm install -g prisma@5.14.0 && \
    mkdir -p /usr/local/lib/node_modules/prisma/node_modules/@prisma/engines && \
    chown -R nextjs:nodejs /usr/local/lib/node_modules/prisma
# Copy start script
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3005

ENV PORT 3005
ENV HOSTNAME "0.0.0.0"

# Use start script to run prisma db push before the server
CMD ["./start.sh", "node", "server.js"]
