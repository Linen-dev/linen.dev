// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const { SKIP_SENTRY } = process.env;
const environment = process.env.NODE_ENV || 'development';

if (!SKIP_SENTRY) {
  Sentry.init({
    dsn:
      SENTRY_DSN ||
      'https://8b0c61ed891044fb8fbea411aa9d6b8a@o1159351.ingest.sentry.io/6243155',
    tracesSampleRate: 1.0,
    environment,
  });
}
