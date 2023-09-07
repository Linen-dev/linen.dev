module.exports = {
  apps: [
    {
      name: 'queue',
      script: 'node dist/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bot1',
      script: 'node dist/discord-bot.js bot=1',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'bot2',
      script: 'node dist/discord-bot.js bot=2',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'pagination',
      script: 'node dist/pagination.js',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 1000 * 60 * 30,
    },
  ],
};
