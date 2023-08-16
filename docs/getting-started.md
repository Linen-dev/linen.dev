# Linen.dev

## Linen folder structure

Linen is a mono repo with multiple apps and packages in the same place.

Since we have multiple applications like Desktop client and a server rendered app. We share the UI code between them with the packages/ui folder.

The apps folder contains all the applications and each app imports the UI code from packages/ui.

- web: Next.js server rendered app - along with backend apis
- desktop: Tauri desktop client
- push_service: Push notification server built with Phoneix and Elixir

## Requirements

- node >=16 (https://github.com/nvm-sh/nvm)
- yarn (npm install -g yarn)
- postgres 13 (or docker and docker-compose)

> linux: installing node with snapcraft isn't compatible with Prisma, please use NVM instead.

## Getting Started

you will need at minimum one secret: [how to generate a secret](#how-to-generate-a-secret)

```bash
# prepare environment variables
cp apps/web/.env.example .env
# windows: copy apps\web\.env.example .env

# create a new secret, open the .env file, update NEXTAUTH_SECRET key with the new secret

# optional (for push notifications)
# create another secret, open the .env file, update PUSH_SERVICE_KEY key with the new secret

# install dependencies
yarn install

# skip if you have postgres installed (starting the database)
cd dev
# windows-only: set COMPOSE_CONVERT_WINDOWS_PATHS=1
docker-compose up -d
cd ..

# Increase the Nodejs heap size
# Recommended if you run into JavaScript heap out of memory issue
export NODE_OPTIONS=--max-old-space-size=8192


# build dependencies
yarn build:deps

## migrate database
yarn migrate:db

# start the web
yarn dev:web

# For hot-reloading in frontend development
# Open in a separate terminal
yarn tf ui dev
```

_"tf" is just a shortcut for "turbo --filter"_

> Only credentials sign-in method enabled by default. To setup github sign-in or magic link sign-in...TODO

## How to generate a secret

```bash
# macos/linux
openssl rand -base64 32

# windows
# on powershell or cdm, type 'node' and hit enter, node should be open now.
node
# type and hit enter
require('crypto').randomBytes(32).toString('base64');
# ctrl-c twice for close node
```

## Testing

**!important: be sure to run getting started steps first**

```bash
## migrate database
yarn migrate:test:db
# test command
yarn tf web... test
```

_the "..." after "web" is used to run same command over all dependencies_

# Desktop client

## Build Tauri desktop client

```bash
# done in root folder
yarn install
yarn build:deps

cd packages/spa
yarn tauri build
```

## Prerequisites

Follow - https://tauri.app/v1/guides/getting-started/prerequisites

### For local development

```bash
# done in root folder
yarn build:deps
yarn dev:web

# Optional set up push service

# in another terminal
cd packages/spa
cp .env.example .env
# windows: copy .env.example .env
yarn tauri dev
```

> Note: Email sign in for development mode doesn't work yet, because it requires deep linking. So testing has to be done with username and password sign in

### Release

- bump up the version on packages/spa/src-tauri/tauri.conf.json (line 11) and push it to main
- go to https://github.com/Linen-dev/desktop-client/actions/workflows/main.yml and hit the "run workflow"
- after the workflow finishes go to https://github.com/Linen-dev/desktop-client/releases

### Testing with push notifications

Install Elixir: https://elixir-lang.org/install.html

> windows: you may need to use cmd instead of powershell

```bash
# if the web service is already running, use another terminal

# go to push service folder
cd apps
cd push_service

# create a .env file with:
MIX_ENV=prod
AUTH_SERVICE_URL=http://localhost:3000
PUSH_SERVICE_KEY= # must be the same secret as defined on .env on root folder
SECRET_KEY_BASE= # generate a new secret

# install deps
mix local.hex --force
mix local.rebar --force
mix deps.get
# start the server
npx dotenv -e .env -- mix phx.server
# you should see an output similar to:
# <time> [info] Access PushServiceWeb.Endpoint at https://example.com

# restart the web service (yarn dev:web)
```

## (Optional) Local domain redirect testing

1. Ask for invite for ngrok account
2. Setup [ngrok](https://ngrok.io/)
3. pick subdomain i.e kam-test.ngrok.io
4. Update dev database to have the redirect url `update accounts set "redirectDomain"='kam-test.ngrok.io' where id = '9677cb41-033e-4c1a-9ae5-ef178606cad3';` - replace with your subdomain that you chose
5. run ngrok tunnel `ngrok http --region=us --hostname=kam-test.ngrok.io 3000`
