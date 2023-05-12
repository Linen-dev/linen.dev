import { cleanEnv, url } from 'envalid';

const env = cleanEnv(process.env, {
  REACT_APP_LINEN_BASE_URL: url(),
  REACT_APP_PUSH_SERVICE_URL: url(),
});

export const baseLinen = env.REACT_APP_LINEN_BASE_URL;
export const baseAuth = `${baseLinen}/api/auth`;

// these paths are been redirect to nextjs web
export const pathsToRedirect = [
  '/metrics',
  '/configurations',
  '/branding',
  '/members',
  '/plans',
];
