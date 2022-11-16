# Install dependencies only when needed
FROM public.ecr.aws/docker/library/node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Install dependencies based on the preferred package manager
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
RUN npm install pm2 -g

# Rebuild the source code only when needed
FROM public.ecr.aws/docker/library/node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_DYNAMO_CACHE true
ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL
ARG NEXT_PUBLIC_PUSH_SERVICE_URL
ENV NEXT_PUBLIC_PUSH_SERVICE_URL $NEXT_PUBLIC_PUSH_SERVICE_URL
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM public.ecr.aws/docker/library/node:16-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# You only need to copy next.config.js if you are NOT using the default configuration
RUN npm install sharp
COPY --from=builder /app ./

# Automatically leverage output traces to reduce image size 
# https://nextjs.org/docs/advanced-features/output-file-tracing

USER nextjs
EXPOSE 3000
ENV PORT 3000
# CMD ["node", "server.js"]
