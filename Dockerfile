# Stage 1: install dependencies
FROM public.ecr.aws/docker/library/node:16 as deps
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
ENV NODE_ENV production
RUN npm ci

# Stage 2: build
FROM public.ecr.aws/docker/library/node:16 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV LONG_RUNNING true
RUN npx prisma generate
RUN npm run build

# Stage 3: run
FROM public.ecr.aws/docker/library/node:16
WORKDIR /app
COPY --from=build /app ./
ENV PORT 3000
EXPOSE 3000