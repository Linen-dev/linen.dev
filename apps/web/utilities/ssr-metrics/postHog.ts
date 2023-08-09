import { PostHog } from 'posthog-node';

const POSTHOG_APIKEY = process.env.SSR_POSTHOG_API_KEY!;
const isProd = process.env.NODE_ENV === 'production';

export const postHog =
  isProd && !!POSTHOG_APIKEY
    ? new PostHog(POSTHOG_APIKEY, {
        flushAt: 1,
        flushInterval: 0,
        enable: process.env.POSTHOG_SERVER_ENABLE === 'true',
        requestTimeout: Number(process.env.POSTHOG_TIMEOUT || 1000),
        disableGeoip: false,
      })
    : undefined;
