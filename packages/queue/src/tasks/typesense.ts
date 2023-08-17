import {
  dump,
  setup,
  sync,
  syncAll,
  deletion,
  refreshApiKeys,
} from '@linen/typesense';
import type { JobHelpers } from 'graphile-worker';
import { KeepAlive } from '../helpers/keep-alive';
import { Logger } from '../helpers/logger';

export const typesenseSetup = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await setup({ accountId: payload.accountId, logger });

  keepAlive.end();
};

export const typesenseDump = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await dump({ accountId: payload.accountId, logger });

  keepAlive.end();
};

export const typesenseSync = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await sync({ accountId: payload.accountId, logger });

  keepAlive.end();
};

export const typesenseSyncAll = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await syncAll({ logger });

  keepAlive.end();
};

export const typesenseDeletion = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await deletion({
    accountId: payload.accountId,
    threadId: payload.threadId,
    logger,
  });

  keepAlive.end();
};

export const typesenseRefreshApiKeys = async (
  payload: any,
  helpers: JobHelpers
) => {
  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await refreshApiKeys();

  keepAlive.end();
};
