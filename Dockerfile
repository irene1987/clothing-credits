FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ./node_modules/.bin/prisma generate
RUN npm run build

FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Aggiunte per il seed
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# QUESTO PER IMPORTARE GLI UTENTI AD OGNI DEPLOY --> lascia comando vuoto nel pre-deploy
# CMD ["sh", "-c", "node_modules/.bin/prisma db push && node_modules/.bin/tsx prisma/import-users.ts && node_modules/.bin/tsx prisma/seed.ts && node server.js"]


# QUESTO PER IL DEPLOY NORMALE --> metti questo comando nel pre-deploy: node_modules/.bin/prisma db push
CMD ["sh", "-c", "node_modules/.bin/tsx prisma/seed.ts && node server.js"]