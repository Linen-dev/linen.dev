#!/bin/bash

set -e

function create_user_and_database() {
	local db=$1
	psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
	  CREATE USER ${db} WITH PASSWORD '${db}' CREATEDB;
	  /*
     * CREATEDB ability is required for Prisma Migrate to create shadow database
     * See: https://www.prisma.io/docs/concepts/components/prisma-migrate/shadow-database
     */
	  CREATE DATABASE ${db};
	  GRANT ALL PRIVILEGES ON DATABASE ${db} TO ${db};
EOSQL
}

if [ ! -z "${APP_DB}" ]; then
	for db in $(echo ${APP_DB} | tr ',' ' '); do
	  echo "Creating database '${db}'..."
		create_user_and_database ${db}
		echo "Database '${db}' created"
	done
fi