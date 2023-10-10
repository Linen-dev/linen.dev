import { cleanEnv, str, url } from 'envalid';

export const env = cleanEnv(process.env, {
  REACT_APP_LINEN_BASE_URL: url(),
  REACT_APP_PUSH_SERVICE_URL: url(),
  REACT_APP_PUBLIC_POSTHOG_KEY: str({ default: '' }),
  REACT_APP_PUBLIC_POSTHOG_HOST: str({ default: '' }),
});

export const baseLinen = env.REACT_APP_LINEN_BASE_URL;
export const baseAuth = `${baseLinen}/api/auth`;
