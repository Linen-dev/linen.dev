# develop

```bash
# install packages
yarn install
# start the database
cd dev && docker-compose up -d
# Migrate database
yarn run db:migrate
# run apps
yarn dev
```

# to build

```bash
# install packages
yarn install
# start the database
cd dev && docker-compose up -d
# run apps
yarn build
```

# If yarn dev fails:

```bash
yarn turbo --filter=@linen/web^... build
```
