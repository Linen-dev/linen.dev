import { syncJob } from '@linen/web/services/accounts/sync';
import type { JobHelpers } from 'graphile-worker';
import { KeepAlive } from '../helpers/keep-alive';

export const sync = async (payload: any, helpers: JobHelpers) => {
  helpers.logger.info(JSON.stringify(payload));

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  const fullSync = helpers.job.attempts === 1;
  await syncJob({ ...payload, fullSync });

  keepAlive.end();
};
