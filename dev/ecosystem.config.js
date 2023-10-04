require('dotenv').config({ path: '../.env' });

module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'yarn td web',
      cwd: '..',
    },
    {
      name: 'queue',
      script: 'yarn tsx watch src/index.ts',
      cwd: '../packages/queue',
    },
    // {
    //   name: 'bot1',
    //   script: 'yarn tsx src/discord-bot.ts bot=1',
    //   cwd: '../packages/queue',
    // },
    // {
    //   name: 'bot2',
    //   script: 'yarn tsx src/discord-bot.ts bot=2',
    //   cwd: '../packages/queue',
    // },
    // {
    //   name: 'pagination',
    //   script: 'yarn tsx src/pagination.ts',
    //   cwd: '../packages/queue',
    //   restart_delay: 1000 * 60 * 30,
    // },
    {
      name: 'push-service',
      script: 'mix phx.server',
      cwd: '../apps/push_service',
      env: {
        MIX_ENV: 'prod',
        PORT: 4000,
        PUSH_SERVICE_KEY: process.env.PUSH_SERVICE_KEY,
        AUTH_SERVICE_URL:
          process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
        SECRET_KEY_BASE: process.env.SECRET_KEY_BASE,
      },
    },
    // {
    //   name: 'https-proxy',
    //   cwd: '/opt/homebrew/bin/',
    //   script: `ngrok http --region=us --hostname=${process.env.NGROK_HOSTNAME} 3000`,
    // },
    {
      name: 'llm-server',
      script: 'yarn tsx watch src/server.ts',
      cwd: '../packages/llm',
    },
  ],
};
