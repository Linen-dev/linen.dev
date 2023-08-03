import { Logger } from '@linen/types';

/**
 * useful helper to retry promises that may fail, usually requests to discord and slack API
 *
 * slack API has documented that on 429 status (too many requests) we should use the parameter 'retry-after'
 * on the error headers, but it doesn't work, we still getting throttled, we are using jitter back off instead.
 *
 * @param promise the promise to be executed
 * @param retries default is 10
 * @param skipOn when error status attribute matches 404, 403 or 401 it stops, it is possible to override this array
 * @returns promise result or undefined
 */
export async function retryPromise({
  promise,
  retries = 10,
  skipOn = [404, 403, 401],
  logger,
}: {
  promise: Promise<any>;
  retries?: number;
  skipOn?: number[];
  logger: Logger;
}) {
  let attempts = 0;
  let lastError;
  while (attempts < retries) {
    attempts++;
    try {
      return await promise;
    } catch (error: any) {
      if (skipOn.includes(error?.status)) {
        logger.error({ cause: `Skip retry due error status: ${error.status}` });
        throw error;
      }
      const sleepSeconds = jitter(attempts);
      lastError = error;
      logger.error({
        cause: `retry promise in :: ${sleepSeconds} seconds :: ${error.message} ${error.status}`,
      });
      await sleep(sleepSeconds * 1000);
    }
  }
  logger.error({ attempts, error: lastError.message || lastError });
  return;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const random_between = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const jitter = (n: number) => {
  let base = 5;
  let cap = 2000;
  let temp = Math.min(cap, base * 2 ** n);
  return Math.floor(temp / 2 + random_between(0, temp / 2));
};
