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

## Local domain redirect testing

1. Ask for invite for ngrok account
2. Setup [ngrok](https://ngrok.io/)
3. pick subdomain i.e kam-test.ngrok.io
4. Update dev database to have the redirect url `update accounts set "redirectDomain"='kam-test.ngrok.io' where id = '9677cb41-033e-4c1a-9ae5-ef178606cad3';` - replace with your subdomain that you chose
5. run ngrok tunnel `ngrok http --region=us --hostname=kam-test.ngrok.io 3000`