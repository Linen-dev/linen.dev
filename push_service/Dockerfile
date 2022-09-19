FROM public.ecr.aws/docker/library/elixir:1.13-alpine

RUN mkdir /app
COPY . /app
WORKDIR /app

RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix deps.get --only prod

ENV MIX_ENV prod
ENV PUSH_SERVICE_KEY $PUSH_SERVICE_KEY 
ENV SECRET_KEY_BASE $SECRET_KEY_BASE 

ENV PORT 4000
EXPOSE 4000

RUN mix compile

# CMD mix phx.server