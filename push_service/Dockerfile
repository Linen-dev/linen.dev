FROM public.ecr.aws/docker/library/elixir:1.13-alpine

RUN mkdir /app
COPY . /app
WORKDIR /app

RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix deps.get --only prod

EXPOSE 4000

ENV PORT=4000
ENV MIX_ENV=prod

RUN mix compile

# CMD mix phx.server