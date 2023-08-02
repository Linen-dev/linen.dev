module.exports = {
  apps: [
    {
      name: 'queue',
      script: 'yarn tsx ./src/index.ts',
    },
    {
      name: 'bot1',
      script: 'yarn tsx ./src/discord-bot.ts bot=1',
    },
    {
      name: 'bot2',
      script: 'yarn tsx ./src/discord-bot.ts bot=2',
    },
    {
      name: 'pagination',
      script: 'yarn tsx ./src/pagination.ts',
      restart_delay: 1000 * 60 * 30,
    },
  ],
};
