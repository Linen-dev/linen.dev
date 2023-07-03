// npx pm2 start dev.config.js

require('dotenv').config({ path: './.env' });

module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'yarn dev',
      cwd: '../apps/web',
      env: {
        PORT: 3000,
      },
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
  ],
};
