import { captureException, flush, withSentry } from '@sentry/nextjs';

async function captureExceptionAndFlush(error: unknown) {
  captureException(error);
  await flush(2000);
}

export { withSentry, captureException, captureExceptionAndFlush };
