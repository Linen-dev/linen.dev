import { cleanEnv, str, url, host } from 'envalid';

export const env = cleanEnv(process.env, {
  TYPESENSE_ADMIN: str(),
  DATABASE_URL: url(),
  NEXT_PUBLIC_TYPESENSE_HOST: host(),
  TYPESENSE_SEARCH_ONLY: str(),
});
