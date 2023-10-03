# overview

This repo is using typesense and openai to answer questions. The data comes from various sources.

# setup

Install deps:

```bash
yarn
```

Copy and set .env variables.

```bash
cp .env.sample .env
```

We're using typescript, so you need to build the server.

```bash
yarn build
```

The server needs some data to work with, so you need to crawl for it. We use typescript,
so the cli script needs to be compiled first. For ease of use, you can use the tsx script.

The script is used for adding more context like faq, blogs, websites, github issues or other data.
Currently it is a manual step and we will need to automate it in the future.

```bash
yarn crawl
```

You can start the server now.

```bash
yarn start
```

# How to run:

```
yarn build
yarn start
```

To get this working locally where you can send a message to a channel and get a response from the bot you need to do the following:

You will be pointing to a local database, a local linen-app, a local llm-linen, and a production typesense.

Step 0:
Make sure your linen.dev repo is upto date and can run all the code and have all the environment variables
You can run everything in Linen.dev by

```
yarn install
yarn migrate:db
yarn prisma generate
cd dev

./up.sh
```

Step 1:
Decide which account you want to test it on take note of the accountId
Decide which channel locally you want to use as test where you send a message and the bot can respond back. You then need to save the CHANNELID
Decide which community you want to search through with typesense. You then will need to get the communityName either REDIRECT_URL|SLACK_DOMAIN|DISCORD_DOMAIN (note you can only choose a public typesense instance right now because of permissions)

Step 2:
In the accounts table of the community you want to use to test set "searchSettings" to

```
{
  "engine": "typesense",
  "scope": "private",
  "apiKey": "private"
}
```

Step 3:
In channelIntegrations table you will need to create a new channel integration:

```
{
  "channelsIntegration": [
    {
      "id": CHANNELID_OF_THE_BOT, #Doesn't matter what this is you can reuse the channel id if you want
      "createdAt": "2023-09-20T19:07:17.091Z",
      "updatedAt": null,
      "channelId": CHANNELID_OF_THE_BOT,
      "type": "LLM",
      "externalId": CHANNELID_OF_THE_BOT, # Doesn't matter what this is you can reuse the channel id if you want
      "data": "{\"communityName\": REDIRECT_URL|COMMUNITY_NAME}",
      "createdByUserId": USER_ID_THAT_YOU_WILL_BE_USING_TO_TEST_THE_BOT,
      "updatedByUserId": null
    }
  ]
}
```

# deployment

currently our deployment is manual and we will need to automate it in the future.

```bash
# connect to the ec2

# fetch changes
git pull

# install deps
yarn install

# build code
yarn build

# restart service
pm2 restart ecosystem.config.js
```
