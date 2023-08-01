import { syncJob } from '@linen/web/services/accounts/sync';
import type { JobHelpers } from 'graphile-worker';

export const sync = async (payload: any, helpers: JobHelpers) => {
  const fullSync = helpers.job.attempts === 1;
  helpers.logger.info(JSON.stringify(payload));
  const result = await syncJob({ ...payload, fullSync });
  helpers.logger.info(JSON.stringify(result));
};
