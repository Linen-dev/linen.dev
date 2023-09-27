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
      script: 'yarn td queue',
      cwd: '..',
    },
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
  ],
};
