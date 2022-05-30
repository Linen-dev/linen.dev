### slack sync

this script will replace our api sync endpoint

### how to run

be sure that your .env file is set up as the .env.example

```bash
npm install
npx ts-node --skip-project bin/slack-sync/index.ts --accountId=uuid
```

### optional parameters

there also an option to synchronize just a specific channel and update a domain

you need to set a flag at the end of the command, channelId or/and domain

```bash
npm install
npx ts-node --skip-project bin/slack-sync/index.ts --accountId=uuid --channelId=uuid --domain=fake.com
```
