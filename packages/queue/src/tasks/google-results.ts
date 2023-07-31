import * as crawler from '@linen/web/services/crawler';
import { type JobHelpers } from 'graphile-worker';

export const crawlGoogleResults = async (payload: any, helpers: JobHelpers) => {
  await crawler.crawlGoogleResults();
};
