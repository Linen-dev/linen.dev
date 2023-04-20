import { UrlType } from './utils/types';

export const batchSize = 1000;
export const bodyLengthLimit = 50;
export const bodyLengthHighPriority = 500;

export const linenDomain = 'www.linen.dev';

export const lastIncrementId = 9999999999;

export function filterThreads(thread: UrlType) {
  return thread.priority > 0.7;
}

export function sortThreads(a: UrlType, b: UrlType) {
  return b.priority - a.priority;
}
