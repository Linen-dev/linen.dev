import { dump } from '@linen/typesense';
import type { JobHelpers } from 'graphile-worker';
import { KeepAlive } from '../helpers/keep-alive';
import { Logger } from '../helpers/logger';

export const typesenseDump = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await dump({ accountId: payload.accountId, logger });

  keepAlive.end();
};
