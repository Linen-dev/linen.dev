module.exports = {
  apps: [
    {
      name: 'queue',
      script: 'yarn tsx ./src/index.ts',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bot1',
      script: 'yarn tsx ./src/discord-bot.ts bot=1',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bot2',
      script: 'yarn tsx ./src/discord-bot.ts bot=2',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pagination',
      script: 'yarn tsx ./src/pagination.ts',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 1000 * 60 * 30,
    },
  ],
};
