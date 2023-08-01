import type { JobHelpers } from 'graphile-worker';
import { prisma, messageAttachments } from '@linen/database';
import { deleteFiles } from '@linen/web/services/aws/s3';
import { sendNotification } from '@linen/web/services/slack';
import AccountsService from '@linen/web/services/accounts';
import { Logger } from '../helpers/logger';

export const removeCommunity = async (
  payload: { accountId: string },
  helpers: JobHelpers
) => {
  const logger = new Logger(helpers.logger);
  await task(logger, payload);
};

async function task(logger: Logger, payload: { accountId: string }) {
  logger.info(payload);

  const account = await AccountsService.getMoreInfo(payload.accountId);
  const moreInfo = JSON.stringify(account);

  await sendNotification(
    `[INFO] Remove account ${payload.accountId} process started: ${moreInfo}`
  );
  try {
    await cleanUp({ accountId: payload.accountId, logger });
    await sendNotification(
      `[INFO] Remove account ${payload.accountId} process finished: ${moreInfo}`
    );
  } catch (error) {
    await sendNotification(
      `[ERROR] Remove account ${payload.accountId} process failed: ${moreInfo}`
    );
    logger.error({ error });
    throw error;
  }
}

async function cleanUp({
  accountId,
  logger,
}: {
  accountId: string;
  logger: Logger;
}) {
  const channels = await prisma.channels.findMany({
    select: { id: true, channelName: true },
    where: { accountId },
  });

  for (const channel of channels) {
    logger.info({ channel });
    logger.setPrefix(channel.channelName);

    const mentionsCount = await prisma.mentions.deleteMany({
      where: { messages: { channelId: channel.id } },
    });
    logger.info({ mentionsCount });
    const attachments = await prisma.messageAttachments.findMany({
      where: { messages: { channelId: channel.id } },
    });
    logger.info({ attachmentsCount: attachments.length });
    await processAttachments({ attachments, logger });

    const messageCount = await prisma.messages.deleteMany({
      where: { channelId: channel.id },
    });
    logger.info({ messageCount });
    const threadCount = await prisma.threads.deleteMany({
      where: { channel: { id: channel.id } },
    });
    logger.info({ threadCount });

    const channelMembershipCount = await prisma.memberships.deleteMany({
      where: { channelsId: channel.id },
    });
    logger.info({ channelMembershipCount });

    const channelIntegrationsCount =
      await prisma.channelsIntegration.deleteMany({
        where: { channelId: channel.id },
      });
    logger.info({ channelIntegrationsCount });

    await prisma.channels.delete({
      where: { id: channel.id },
    });
  }
  logger.cleanPrefix();
  logger.info({ channelsCount: channels.length });

  const invitesCount = await prisma.invites.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info({ invitesCount });

  const usersCount = await prisma.users.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info({ usersCount });

  const authsCount = await prisma.auths.updateMany({
    where: { accountId },
    data: { accountId: null },
  });
  logger.info({ authsCount });

  const slackCount = await prisma.slackAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info({ slackCount });

  const discordCount = await prisma.discordAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info({ discordCount });

  const apiKeysCount = await prisma.apiKeys.deleteMany({
    where: { accountId: accountId },
  });
  logger.info({ apiKeysCount });

  const accountCount = await prisma.accounts.delete({
    where: { id: accountId },
  });
  logger.info({ accountCount });
}

async function processAttachments({
  attachments,
  logger,
}: {
  attachments: messageAttachments[];
  logger: Logger;
}) {
  const keys = attachments
    .filter((e) => !!e.internalUrl)
    .map((attachment) => ({
      Key: attachment
        .internalUrl!.split('/')
        .slice(3)
        .join('/')
        .replace(/\u0010/, ''),
    }));

  while (keys.length) {
    const slice = keys.splice(0, 1000);
    try {
      await deleteFiles(slice);
    } catch (error) {
      logger.error({ slice });
      throw error;
    }
  }
}
