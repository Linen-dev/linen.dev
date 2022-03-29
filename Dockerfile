# Stage 1: install dependencies
FROM node:16 as deps
WORKDIR /app
COPY package*.json .
COPY prisma prisma
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
RUN npm install
RUN npx prisma generate

# Stage 2: build
FROM node:16 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# TODO: It’s better if we only bring in what we need. We should use the Next.js src directory which should consists
#       entirely of files we need to build our app (see: https://nextjs.org/docs/advanced-features/src-directory)
RUN npm run build

# Stage 3: run
FROM node:16
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]