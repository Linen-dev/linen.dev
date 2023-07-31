import { syncJob } from '@linen/web/services/accounts/sync';
import { type JobHelpers } from 'graphile-worker';

export const sync = async (payload: any, helpers: JobHelpers) => {
  helpers.logger.info(JSON.stringify(payload));
  const result = await syncJob(payload);
  helpers.logger.info(JSON.stringify(result));
};
