// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;
const SKIP_SENTRY = process.env.SKIP_SENTRY === 'true';

if (!SKIP_SENTRY) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.5,
  });
}
