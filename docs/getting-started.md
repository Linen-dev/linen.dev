# Linen.dev

## Requirements

- node >=16 (https://github.com/nvm-sh/nvm)
- yarn (npm install -g yarn)
- postgres 13 (or docker and docker-compose)

> installing node with snapcraft isn't compatible with Prisma, please use NVM instead.

## Getting Started

```bash
# prepare environment variables
cp apps/web/.env.example .env
# win: copy apps\web\.env.example .env

# generate secret
openssl rand -base64 32 # edit the .env file, update NEXTAUTH_SECRET key with the result
# win: on node, you can use this line: crypto.randomBytes(32).toString('base64')

# export the envs into the shell
source .env
# win: skip

# install dependencies
yarn install

# skip if you have postgres installed (starting the database)
cd dev && docker-compose up -d && cd ..

# build dependencies
yarn build:deps

## migrate database
yarn migrate:db

# start the web
yarn dev:web

# For hot-reloading in frontend development
# Open in a separate terminal
cd packages/ui && yarn dev
```

Only credentials sign-in method enabled by default. To setup github sign-in or magic link sign-in:
// TODO: steps to setup github signin and magic link

## (Optional) Local domain redirect testing

1. Ask for invite for ngrok account
2. Setup [ngrok](https://ngrok.io/)
3. pick subdomain i.e kam-test.ngrok.io
4. Update dev database to have the redirect url `update accounts set "redirectDomain"='kam-test.ngrok.io' where id = '9677cb41-033e-4c1a-9ae5-ef178606cad3';` - replace with your subdomain that you chose
5. run ngrok tunnel `ngrok http --region=us --hostname=kam-test.ngrok.io 3000`
