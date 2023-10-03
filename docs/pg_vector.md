# pg_vector

## local development

current docker-compose was update to support pg_vector extension.

restart services with `docker-compose up -d`

then run the migration changes `yarn migrate:changes`

If it fails due permission denied, we will need to recreate the services

```bash
# on root folder
cd dev
# shut down services
docker-compose down
# clean up volume
docker volume rm dev_pgdata
# start services
docker-compose up -d
# run migration
yarn migrate:changes
```
