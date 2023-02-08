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
      name: 'queue',
      script: 'npx tsx watch queue/index.ts',
      cwd: '../apps/web',
    },
    {
      name: 'packages',
      script: 'yarn turbo --filter=@linen/web^... dev',
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
        AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
        SECRET_KEY_BASE: process.env.SECRET_KEY_BASE,
      },
    },
    {
      name: 'https-proxy',
      cwd: '/opt/homebrew/bin/',
      script: `ngrok http --region=us --hostname=linen-san.ngrok.io 80`,
    },
  ],
};
