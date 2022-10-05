require('dotenv').config();

const PORT = process.env.PORT || 3000;

module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'npm run dev',
      cwd: '../nextjs',
      env: {
        PORT,
      },
    },
    {
      name: 'queue-chat',
      script: 'npm run queue:worker:chat-sync',
      cwd: '../nextjs',
    },
    {
      name: 'queue-sync',
      script: 'npm run queue:worker:sync',
      cwd: '../nextjs',
    },
    {
      name: 'queue-webhook',
      script: 'npm run queue:worker:webhook',
      cwd: '../nextjs',
    },
    {
      name: 'push-service',
      script: 'mix phx.server',
      cwd: '../push_service',
      env: {
        MIX_ENV: 'prod',
        PORT: 4000,
        PUSH_SERVICE_KEY: process.env.PUSH_SERVICE_KEY,
        AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
        SECRET_KEY_BASE: process.env.SECRET_KEY_BASE,
      },
    },
    {
      name: 'https-proxy',
      cwd: '/opt/homebrew/bin/',
      script: `ngrok http --region=us --hostname=linen-san.ngrok.io ${PORT}`,
    },
  ],
};
