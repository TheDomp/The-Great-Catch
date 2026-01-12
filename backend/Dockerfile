FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl 3.0 for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .

# Ensure prisma binary target matches Alpine
RUN npx prisma generate

RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Install openssl 3.0 for Prisma runtime
RUN apk add --no-cache openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 4000

CMD ["node", "dist/index.js"]
