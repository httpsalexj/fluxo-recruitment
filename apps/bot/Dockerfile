FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/bot/package*.json apps/bot/
RUN npm install --workspace @fluxo/bot

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/bot/node_modules ./apps/bot/node_modules
COPY . .
RUN npm run build --workspace @fluxo/bot

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/package.json ./package.json
COPY --from=deps /app/apps/bot/node_modules ./node_modules
CMD ["node", "dist/index.js"]
