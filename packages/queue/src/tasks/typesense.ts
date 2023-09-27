import {
  setup,
  // sync,
  // syncAll,
  handleDeletion,
  refreshApiKeys,
  handleChannelNameUpdate,
  handleChannelTypeUpdate,
  handleCommunityUpdate,
  handleUserNameUpdate,
  handleChannelDeletion,
  handleCommunityDeletion,
  handleMessageCreation,
  handleMessageUpdate,
  handleThreadCreation,
  handleThreadUpdate,
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
  try {
    await setup({ accountId, logger });
  } finally {
    keepAlive.end();
  }
};

// export const typesenseSync = async (payload: any, helpers: JobHelpers) => {
//   const logger = new Logger(helpers.logger);
//   logger.info(payload);

//   const { accountId } = z
//     .object({
//       accountId: z.string().uuid(),
//     })
//     .parse(payload);

//   const keepAlive = new KeepAlive(helpers);
//   keepAlive.start();

//   try {
//     await sync({ accountId, logger });
//   } finally {
//     keepAlive.end();
//   }
// };

// export const typesenseSyncAll = async (_: any, helpers: JobHelpers) => {
//   const logger = new Logger(helpers.logger);

//   const keepAlive = new KeepAlive(helpers);
//   keepAlive.start();

//   try {
//     await syncAll({ logger });
//   } finally {
//     keepAlive.end();
//   }
// };

export const typesenseDeletion = async (payload: any, helpers: JobHelpers) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const { accountId, threadId } = z
    .object({
      accountId: z.string().uuid(),
      threadId: z.string().uuid(),
    })
    .parse(payload);

  await handleDeletion({
    accountId,
    threadId,
    logger,
  });
};

export const typesenseRefreshApiKeys = async (_: any, helpers: JobHelpers) => {
  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  try {
    await refreshApiKeys();
  } finally {
    keepAlive.end();
  }
};

export const typesenseOnChannelNameUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);

  const { channelId } = z
    .object({
      channelId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  try {
    await handleChannelNameUpdate({ channelId, logger });
  } finally {
    keepAlive.end();
  }
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

  try {
    await handleChannelTypeUpdate({ channelId });
  } finally {
    keepAlive.end();
  }
};

export const typesenseOnChannelDeletion = async (
  payload: any,
  helpers: JobHelpers
) => {
  const { channelId, accountId, channelName } = z
    .object({
      channelId: z.string().uuid(),
      accountId: z.string().uuid(),
      channelName: z.string(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  try {
    await handleChannelDeletion({ channelId, accountId, channelName });
  } finally {
    keepAlive.end();
  }
};

export const typesenseOnCommunityTypeUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);

  const { accountId } = z
    .object({
      accountId: z.string().uuid(),
    })
    .parse(payload);

  const keepAlive = new KeepAlive(helpers);
  keepAlive.start();

  try {
    await handleCommunityUpdate({ accountId, logger });
  } finally {
    keepAlive.end();
  }
};

export const typesenseOnCommunityDeletion = async (
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
  try {
    await handleCommunityDeletion({ accountId });
  } finally {
    keepAlive.end();
  }
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

  try {
    await handleUserNameUpdate({ accountId, logger, userId });
  } catch (error: any) {
    if (error.message !== 'account missing searchSettings') {
      throw error;
    }
  } finally {
    keepAlive.end();
  }
};

export const typesenseOnMessageCreation = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const parsedPayload = z
    .object({
      accountId: z.string().uuid(),
      threadId: z.string().uuid(),
    })
    .parse(payload);

  await handleMessageCreation({
    ...parsedPayload,
    logger,
  });
};

export const typesenseOnMessageUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const parsedPayload = z
    .object({
      accountId: z.string().uuid(),
      threadId: z.string().uuid(),
    })
    .parse(payload);

  await handleMessageUpdate({
    ...parsedPayload,
    logger,
  });
};

export const typesenseOnThreadCreation = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const parsedPayload = z
    .object({
      accountId: z.string().uuid(),
      threadId: z.string().uuid(),
    })
    .parse(payload);

  await handleThreadCreation({
    ...parsedPayload,
    logger,
  });
};

export const typesenseOnThreadUpdate = async (
  payload: any,
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);
  logger.info(payload);

  const parsedPayload = z
    .object({
      accountId: z.string().uuid(),
      threadId: z.string().uuid(),
    })
    .parse(payload);

  await handleThreadUpdate({
    ...parsedPayload,
    logger,
  });
};
