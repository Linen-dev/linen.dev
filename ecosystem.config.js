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
      // thread-message-count
      name: 'thread-message-count',
      script: 'npx ts-node --skip-project bin/thread-message-count/index.ts',
      // it will run in a rate of 15 minutes
      restart_delay: 15 * MINUTES,
    },
    {
      // this process look for empty slugs on database and try to recreate them
      name: 'slugify',
      script: 'npx ts-node --skip-project bin/slugify/index.ts',
      // it will run in a rate of 15 minutes
      restart_delay: 15 * MINUTES,
    },
    {
      // this function creates alias for all users on our database
      name: 'anonymize-users',
      script: 'npx ts-node --skip-project bin/anonymize/index.ts',
      // it will run in a rate of 15 minutes
      restart_delay: 15 * MINUTES,
    },
  ],
};
