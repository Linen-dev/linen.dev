module.exports = {
  apps: [
    {
      name: 'next',
      script: 'yarn start',
    },
    {
      name: 'queue',
      script: 'yarn tsx queue/index.ts',
    },
    {
      name: 'bot1',
      script: 'node dist/discord.js bot=1',
    },
    {
      name: 'bot2',
      script: 'node dist/discord.js bot=2',
    },
    {
      name: 'pagination',
      script: 'node dist/pagination.js',
      restart_delay: 1000 * 60 * 30,
    },
  ],
};
