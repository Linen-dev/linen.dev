# install dependencies
yarn

# setup postgres
createuser linendev
createdb linendev


# setup the environment
cp .env.example .env
source .env

# run the migrations
npx prisma migrate dev
