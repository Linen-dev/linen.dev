# Linen.dev

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Quick Start

### Environment Variables

Prepare your main environment settings:

```bash
cp .env.example .env
```

Adjust `.env` file to your local environment if needed.

For more information how environment variables are used look here:

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables#using-env-files)

## Set up Slack for local development.

The way to test Slack sync requires each developer to have their own Slack app since Slack API requires a specific a publically webhook and redirect url to be set.

To set up Linen's Slack app you need to follow the steps below:

1. Get an invite to Linen's Ngrok account and set up ngrok's local CLI
2. Setup ngrok with `ngrok http --region=us --hostname=linen-kam.ngrok.io 3000` Replace kam with your name
3. Make a copy of devSetup/sampleAppManifest.yml and change redirect_urls to https://linen-YOURNAME.ngrok.io/api/oauth and request_url to https://linen-YOURNAME.ngrok.io/api/webhook
4. Create a new Slack app at https://api.slack.com/apps?new_app=1 and click `From an app manifest`
5. Paste in the copy of manifest with your modifications
6. Navigate to the newly created app's `Basic Information` in slack
7. Copy `Client ID` and `Client Secret` and paste them into the `.env` file for `NEXT_PUBLIC_SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`
8. Set `NEXT_PUBLIC_REDIRECT_URI` to `https://linen-YOURNAME.ngrok.io/api/oauth` in .env file
9. Start linen with `npm start` and sign up for a new account localhost:3000/signup and install the app to a workspace i.e Linen's workspace or your own custom one (Linen only shows channels with more than 20 threads so probably best to use Linen's workspace)
10. Open up Postman or use curl and hit `localhost:3000/api/scripts/sync?account_id=7649c602-5a12-4f29-a8f6-66e288a243eb` - replace account_id with your account id - you can find the accountId in your local postgres database. This will sync all the Slack channels and threads with your Linen account.

### Database setup

You can run PostgreSQL database locally using Docker [PostgreSQL Image](https://hub.docker.com/_/postgres):

```bash
docker-compose up -d
```

During database initialization two databases will be created `lineddev` for development purpose and `linentest`
for integration tests (see `postgres/initdb/00-init-app-db.sh`).

Together with PostgreSQL, [pgAdmin 4 container](https://www.pgadmin.org/download/pgadmin-4-container/) is setup -
a web based administration tool for the PostgreSQL database.

You can access it at [http://localhost:8080](http://localhost:8080/) (credentials: admin@admin.com/secret).

Click the **Add New Server** button to open the [Server Dialog](https://www.pgadmin.org/docs/pgadmin4/latest/server_dialog.html)
to add a new server definition (use `db` as host name/address and `postgres` for database, username and password).

### Database seeding

To fill the database with initial data run:

```bash
docker exec -i -u postgres linendev_postgres psql linendev < db_seed.sql
```

Run the migration to update the database:

```bash
npx prisma migrate dev
```

## Getting Started

You can run development server locally:

```bash
npm run dev
```

or in the Docker container. But first you have to build the container image:

```bash
docker-compose --profile app build
```

and then run it (run `docker-compose down` if you have run previously to start database):

```bash
docker-compose --profile app up -d
```

It will run PostgreSQL database together with web application (using [profiles with Compose](https://docs.docker.com/compose/profiles/) feature).
Changes on the host, like saving a code file, immediately affect the container causing an incremental build
and a hot reload in the browser.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To stop the containerized application run:

```bash
docker-compose down -d
```

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Set up postgres

```bash
npx prisma migrate dev
```

## Seed the database

Load: http://localhost:3000/api/oneOff
This will fetch all the conversations from Papercups and it will return all the conversations and save the account_id from one of the channels

Update `accountId` const in constants/example.js

## How to run a migration?

```bash
npx prisma migrate dev
npx prisma generate
```

or

```bash
npm run migrate
```

See [Prisma CLI reference](https://www.prisma.io/docs/reference/api-reference/command-reference) for command description.

## How to run integration tests

Setup `.env.test`:

- add `SLACK_TOKEN` to `.env.test` - the integration tests uses a real Slack account
- add `DATABASE_URL=postgresql://linentest:linentest@localhost:5432/linentest` to `.env.test`

```
npm run setup:integration
```

Run tests:

```bash
npm run test:integration
```

Run specific test example:

```bash
npm run test:integration webhook.test.ts
```

## Local domain redirect testing

1. Ask for invite for ngrock account
2. Setup [ngrok](https://ngrok.io/)
3. pick subdomain i.e kam-test.ngrok.io
4. Update dev database to have the redirect url `update accounts set "redirectDomain"='kam-test.ngrok.io' where id = '9677cb41-033e-4c1a-9ae5-ef178606cad3';` - replace with your subdomain that you chose
5. run ngrok tunnel `ngrok http --region=us --hostname=kam-test.ngrok.io 3000`

## Deploy to AWS

First setup [AWS-CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [configure](First setup [AWS-CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and configure it https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html
) it for your AWS account.

Increment the version for the app:

```bash
export APP_VERSION=v5
source .env
```

From the root folder of the project build the production docker image:

```bash
# This is required only for MacOs with M1 CPU
export DOCKER_DEFAULT_PLATFORM=linux/amd64
```

```bash
docker build \
  --build-arg SENTRY_DSN=${SENTRY_DSN} \
  --build-arg SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN} \
  --build-arg SKIP_CACHING_ON_BUILD_STEP=true \
  --build-arg NODE_ENV=production \
  -t linen-dev:${APP_VERSION} . --no-cache
```

Login your docker to AWS repository:

```bash
aws ecr get-login-password \
--region us-east-1 | docker login \
--username AWS \
--password-stdin 775327867774.dkr.ecr.us-east-1.amazonaws.com
```

Tag and push the image to the AWS repository:

```bash
docker tag linen-dev:${APP_VERSION} 775327867774.dkr.ecr.us-east-1.amazonaws.com/linen-dev:${APP_VERSION}
docker push 775327867774.dkr.ecr.us-east-1.amazonaws.com/linen-dev:${APP_VERSION}
```

Go to `cdk` folder and run:

```bash
npm install
```

Build the deployment:

```bash
npm run build
```

Deploy the stack:

```bash
npm run cdk deploy
```
