# install dependencies
yarn

# setup postgres
createuser linendev
createdb linendev

# seed database
psql linendev < db_seed.sql

# setup the environment
cp .env.example .env
source .env

# run the migrations
npx prisma migrate dev
