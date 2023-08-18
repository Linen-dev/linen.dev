import {
  dump,
  setup,
  sync,
  syncAll,
  deletion,
  refreshApiKeys,
  handleChannelNameUpdate,
  handleChannelTypeUpdate,
  handleCommunityUpdate,
  handleUserNameUpdate,
} from '@linen/typesense';
import type { JobHelpers } from 'graphile-worker';
import { KeepAlive } from '../helpers/keep-alive';
import { Logger } from '../helpers/logger';
import z from 'zod';

export const typesenseSetup = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const { accountId } = z
    .object({
      accountId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await setup({ accountId, logger });

  keepAlive.end();
};

export const typesenseDump = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const { accountId } = z
    .object({
      accountId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await dump({ accountId, logger });

  keepAlive.end();
};

export const typesenseSync = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const { accountId } = z
    .object({
      accountId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await sync({ accountId, logger });

  keepAlive.end();
};

export const typesenseSyncAll = async (_: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await syncAll({ logger });

  keepAlive.end();
};

export const typesenseDeletion = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const { accountId, threadId } = z
    .object({
      accountId: z.string().uuid(),
      threadId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await deletion({
    accountId,
    threadId,
    logger,
  });

  keepAlive.end();
};

export const typesenseRefreshApiKeys = async (_: any, helpers: JobHelpers) => {
  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await refreshApiKeys();

  keepAlive.end();
};

export const typesenseOnChannelNameUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);

  const { accountId, channelId } = z
    .object({
      accountId: z.string().uuid(),
      channelId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await handleChannelNameUpdate({ accountId, channelId, logger });

  keepAlive.end();
};

export const typesenseOnChannelTypeUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const { channelId } = z
    .object({
      channelId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await handleChannelTypeUpdate({ channelId });

  keepAlive.end();
};

export const typesenseOnCommunityTypeUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const { accountId } = z
    .object({
      accountId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await handleCommunityUpdate({ accountId });

  keepAlive.end();
};

export const typesenseOnUserNameUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);

  const { accountId, userId } = z
    .object({
      accountId: z.string().uuid(),
      userId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  await handleUserNameUpdate({ accountId, logger, userId });

  keepAlive.end();
};
