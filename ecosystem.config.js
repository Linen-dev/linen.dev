module.exports = {
  apps: [
    {
      name: 'hello',
      script: 'npx ts-node --skip-project bin/hello/index.ts',
      autorestart: false,
      cron_restart: '* * * * *',
    },
  ],
};
