FROM public.ecr.aws/docker/library/node:18 AS builder
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope="@linen/discord-bots" --docker
RUN turbo prune --scope="@linen/pagination" --docker
RUN turbo prune --scope="@linen/web" --docker
RUN turbo prune --scope="@linen/spa" --docker

FROM public.ecr.aws/docker/library/node:18 AS installer
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter='!s3'

FROM public.ecr.aws/docker/library/node:18 AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN yarn global add pm2
# RUN addgroup --system --gid 1001 linenuser
# RUN adduser --system --uid 1001 linenuser
# USER linenuser
COPY --from=installer /app .