import { cleanEnv, port, str } from 'envalid';

const config = cleanEnv(process.env, {
  NEXTAUTH_SECRET: str(),
  DATABASE_URL: str(),
  RDS_CERTIFICATE: str({ default: '' }),
  NODE_ENV: str({ default: 'development' }),
  PORT: port({ default: 3000 }),
});

export default config;
