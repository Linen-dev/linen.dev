require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'npm run dev',
      cwd: '../apps/web',
      env: {
        PORT: 80,
      },
    },
    {
      name: 'queue-two-way',
      script: 'npx tsx queue/workers/two-way-sync.ts',
      cwd: '../apps/web',
    },
    {
      name: 'queue-sync',
      script: 'npm run queue:worker:sync',
      cwd: '../apps/web',
    },
    {
      name: 'queue-webhook',
      script: 'npm run queue:worker:webhook',
      cwd: '../apps/web',
    },
    {
      name: 'queue-email-notification',
      script: 'npx tsx queue/workers/email-notification.ts',
      cwd: '../apps/web',
    },
    {
      name: 'push-service',
      script: 'mix phx.server',
      cwd: '../apps/push_service',
      env: {
        MIX_ENV: 'prod',
        PORT: 4000,
        PUSH_SERVICE_KEY: process.env.PUSH_SERVICE_KEY,
        AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
        SECRET_KEY_BASE: process.env.SECRET_KEY_BASE,
      },
    },
    {
      name: 'linen-bridge-github',
      script: 'npm run dev',
      cwd: '../apps/linen-bridge-github',
      env: {
        PORT: 81,
      },
    },
    {
      name: 'https-proxy',
      cwd: '/opt/homebrew/bin/',
      script: `ngrok http --region=us --hostname=linen-san.ngrok.io 80`,
    },
  ],
};
