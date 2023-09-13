import { syncJob } from '@linen/web/services/accounts/sync';
import type { JobHelpers } from 'graphile-worker';
import { KeepAlive } from '../helpers/keep-alive';
import { Logger } from '../helpers/logger';

export const sync = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  const fullSync = helpers.job.attempts === 1;

  try {
    await syncJob({ ...payload, fullSync, logger });
  } finally {
    keepAlive.end();
  }
};
