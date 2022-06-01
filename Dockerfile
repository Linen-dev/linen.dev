# Stage 1: install dependencies
FROM node:16 as deps
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY prisma prisma
ENV NODE_ENV production
RUN npm ci
RUN npx prisma generate

# Stage 2: build
FROM node:16 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV LONG_RUNNING true
RUN npm run build

# Stage 3: run
FROM node:16
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
ENV PORT 3000
EXPOSE 3000
CMD ["node", "server.js"]