/**
 * useful helper to retry promises that may fail, usually requests to discord and slack API
 *
 * slack API has documented that on 429 status (too many requests) we should use the parameter 'retry-after'
 * on the error headers, but it doesn't work, we still getting throttled, we are using jitter back off instead.
 *
 * @param promise the promise to be executed
 * @param retries default is 3
 * @param skipOn when error status attribute matches 404, 403 or 401 it stops, it is possible to override this array
 * @param sleepSeconds [deprecated]: we are using jitter back off instead
 * @returns promise result or exception
 */
export async function retryPromise({
  promise,
  retries = 3,
  skipOn = [404, 403, 401],
}: {
  promise: Promise<any>;
  retries?: number;
  skipOn?: number[];
  sleepSeconds?: number;
}) {
  let attempts = 0;
  let lastError;
  while (attempts < retries) {
    attempts++;
    try {
      return await promise;
    } catch (error: any) {
      if (skipOn.includes(error?.status)) {
        console.error('Skip retry due error status:', error.status);
        throw error;
      }
      const sleepSeconds = jitter(attempts);
      lastError = error;
      log(error, sleepSeconds);
      await sleep(sleepSeconds * 1000);
    }
  }
  throw lastError.message || lastError;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const log = (error: any, retry: number) => {
  console.error(
    'retry promise in ::',
    retry,
    'seconds ::',
    error.message,
    error.status
  );
};

const random_between = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const jitter = (n: number) => {
  let base = 5;
  let cap = 2000;
  let temp = Math.min(cap, base * 2 ** n);
  return Math.floor(temp / 2 + random_between(0, temp / 2));
};

// export function timeoutAfter(seconds: number) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       reject(new Error('request timed-out'));
//     }, seconds * 1000);
//   });
// }
