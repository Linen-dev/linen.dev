const MINUTES = 60 * 1000;

module.exports = {
  apps: [
    {
      // discord sync process
      name: 'discord-sync',
      script: 'npx ts-node --skip-project bin/discord-sync/index.ts',
      // it will run in a rate of 1 minute
      restart_delay: 1 * MINUTES,
    },
    {
      // this process look for empty slugs on database and try to recreate them
      name: 'slugify',
      script: 'npx ts-node --skip-project bin/slugify/index.ts',
      // it will run every night 0:00 gmt-0
      cron_restart: '0 0 * * *',
      autorestart: false,
    },
    {
      // this function creates alias for all users on our database
      name: 'anonymize-users',
      script: 'npx ts-node --skip-project bin/anonymize/index.ts',
      // it will run every night 0:00 gmt-0
      cron_restart: '0 0 * * *',
      autorestart: false,
    },
  ],
};
