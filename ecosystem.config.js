require('dotenv').config();

const PORT = process.env.PORT || 3000;
const PUSH_SERVICE_KEY = process.env.PUSH_SERVICE_KEY;

if (!PUSH_SERVICE_KEY) throw 'missing vars';

module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'npm run dev',
      cwd: 'nextjs',
      env: {
        PORT,
      },
    },
    {
      name: 'queue-chat',
      script: 'npm run queue:worker:chat-sync',
      cwd: 'nextjs',
    },
    {
      name: 'queue-sync',
      script: 'npm run queue:worker:sync',
      cwd: 'nextjs',
    },
    {
      name: 'queue-webhook',
      script: 'npm run queue:worker:webhook',
      cwd: 'nextjs',
    },
    {
      name: 'push-service',
      script: 'mix phx.server',
      cwd: 'push_service',
      env: {
        PUSH_SERVICE_KEY,
      },
    },
    {
      name: 'https-proxy',
      cwd: '/opt/homebrew/bin/',
      script: `ngrok http --region=us --hostname=linen-san.ngrok.io ${PORT}`,
    },
  ],
};
