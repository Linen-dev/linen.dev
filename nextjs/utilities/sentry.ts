import { captureException, flush, withSentry } from '@sentry/nextjs';

async function captureExceptionAndFlush(error: unknown) {
  captureException(error);
  await flush(2000);
}

function tryCatch<R, T extends (...args: any[]) => Promise<R>>(fn: T): T {
  const g = async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      await captureExceptionAndFlush(error);
      throw error;
    }
  };
  return g as T;
}

// const devWithSentry = (origHandler: any) => {
//   return async (req: any, res: any) => {
//     return origHandler(req, res);
//   };
// };

export { withSentry, captureException, captureExceptionAndFlush, tryCatch };
