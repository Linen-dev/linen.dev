FROM public.ecr.aws/docker/library/node:16 AS builder
ARG MODULE
RUN echo $MODULE
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=$MODULE --docker

FROM public.ecr.aws/docker/library/node:16 AS installer
ARG MODULE
RUN echo $MODULE
ENV DOTS=...
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=$MODULE$DOTS

FROM public.ecr.aws/docker/library/node:16 AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
RUN addgroup --system --gid 1001 linenuser
RUN adduser --system --uid 1001 linenuser
USER linenuser
COPY --from=installer /app .
# CMD node apps/api/dist/index.js