### discord sync

it will get all discord accounts and synchronize it on our database

### cronjob

this process should be executed every 6 hours or less

### run

be sure that your .env file is set up as the .env.example

```bash
yarn install
npx ts-node --skip-project bin/discord-sync/index.ts
```

there also an option to force a full synchronization (used in edge cases when we need to fix something from old messages)

you need to set a flag at the end of the command, full-sync

```bash
yarn install
npx ts-node --skip-project bin/discord-sync/index.ts --full-sync
```
