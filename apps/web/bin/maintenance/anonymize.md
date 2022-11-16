### anonymize users

this function create alias for all users on our database

### cronjob

this process should be executed every 24 hours or less

### run

be sure that your .env file is set up as the .env.example

```bash
npm install
npx ts-node --skip-project bin/anonymize/index.ts
```
