import { config } from 'dotenv';
import { cleanEnv, str } from 'envalid';

config();

const env = cleanEnv(process.env, {
  CLIENT_ID: str(),
  CLIENT_SECRET: str(),
});

export default env;
