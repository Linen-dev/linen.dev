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