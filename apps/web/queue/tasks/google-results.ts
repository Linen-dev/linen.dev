import * as crawler from 'services/crawler';
import { type JobHelpers } from 'graphile-worker';

export const crawlGoogleResults = async (payload: any, helpers: JobHelpers) => {
  await crawler.crawlGoogleResults();
};
