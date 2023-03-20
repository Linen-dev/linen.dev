module.exports = {
  apps: [
    {
      namespace: 'bot',
      name: 'bot1',
      script: 'yarn dev',
      env: {
        BOT: 1,
      },
    },
    {
      namespace: 'bot',
      name: 'bot2',
      script: 'yarn dev',
      env: {
        BOT: 2,
      },
    },
  ],
};
