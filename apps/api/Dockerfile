# Stage 1: Dependencies + Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Build-time ENV
ARG DATABASE_URL
ARG VERSION
ENV DATABASE_URL=$DATABASE_URL
ENV VERSION=$VERSION
RUN npx prisma generate && npm run build

# Stage 2: Production dependencies  
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 3: Runtime
FROM node:22-alpine AS production
WORKDIR /app
RUN apk add --no-cache netcat-openbsd
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma/schema.prisma ./src/prisma/schema.prisma
COPY prisma.config.ts ./prisma.config.ts
COPY start.sh ./
RUN chmod +x start.sh
EXPOSE 8000
CMD ["sh", "./start.sh"]