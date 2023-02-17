import { config } from 'dotenv';
import { cleanEnv, str } from 'envalid';

config();

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
  INTERNAL_API_KEY: str(),
  LINEAR_CLIENT_ID: str(),
  LINEAR_CLIENT_SECRET: str(),
});

export default env;
