import { config } from 'dotenv';
import { cleanEnv, str, num } from 'envalid';

config();

const env = cleanEnv(process.env, {
  BOT: num({ default: 1 }),
  DISCORD_TOKEN: str(),
  DISCORD_TOKEN_2: str(),
});

export default env;
