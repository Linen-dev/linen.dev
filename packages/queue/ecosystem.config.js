module.exports = {
  apps: [
    {
      name: 'queue',
      script: 'node dist/index.js',
    },
    {
      name: 'bot1',
      script: 'node dist/discord-bot.js bot=1',
    },
    {
      name: 'bot2',
      script: 'node dist/discord-bot.js bot=2',
    },
    {
      name: 'pagination',
      script: 'node dist/pagination.js',
      restart_delay: 1000 * 60 * 30,
    },
  ],
};
