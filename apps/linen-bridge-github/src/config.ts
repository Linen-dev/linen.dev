import { config } from 'dotenv';
import { cleanEnv, num, str } from 'envalid';

config();

const env = cleanEnv(process.env, {
  GITHUB_APP_ID: str(),
  GITHUB_PRIVATE_KEY: str(),
  GITHUB_WEBHOOK_SECRET: str(),
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
  PORT: num(),
  INTERNAL_API_KEY: str(),
  LINEN_API: str(),
  BOT_SENDER_ID: num(),
  BOT_SENDER_LOGIN: str(),
});

export default env;
