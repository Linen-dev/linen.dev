import type { JobHelpers, Logger } from 'graphile-worker';
import { prisma, messageAttachments } from '@linen/database';
import { deleteFiles } from '@linen/web/services/aws/s3';
import { sendNotification } from '@linen/web/services/slack';
import AccountsService from '@linen/web/services/accounts';

export const removeCommunity = async (
  payload: { accountId: string },
  helpers: JobHelpers
) => {
  helpers.logger.info(JSON.stringify(payload));
  const account = await AccountsService.getMoreInfo(payload.accountId);
  const moreInfo = JSON.stringify(account);

  await sendNotification(
    `[INFO] Remove account ${payload.accountId} process started: ${moreInfo}`
  );
  try {
    await cleanUp(payload.accountId, helpers.logger);
    await sendNotification(
      `[INFO] Remove account ${payload.accountId} process finished: ${moreInfo}`
    );
  } catch (error) {
    await sendNotification(
      `[ERROR] Remove account ${payload.accountId} process failed: ${moreInfo}`
    );
    console.error(error);
    throw error;
  }
};

export async function cleanUp(accountId: string, logger: Logger) {
  const channels = await prisma.channels.findMany({ where: { accountId } });

  for (const channel of channels) {
    logger.info(channel.channelName);

    const mentionsCount = await prisma.mentions.deleteMany({
      where: { messages: { channelId: channel.id } },
    });
    logger.info(`${channel.channelName} mentionsCount ${mentionsCount.count}`);
    const attachments = await prisma.messageAttachments.findMany({
      where: { messages: { channelId: channel.id } },
    });
    logger.info(`${channel.channelName} attachments ${attachments.length}`);
    await processAttachments(attachments);

    const messageCount = await prisma.messages.deleteMany({
      where: { channelId: channel.id },
    });
    logger.info(`${channel.channelName} messageCount ${messageCount.count}`);
    const threadCount = await prisma.threads.deleteMany({
      where: { channel: { id: channel.id } },
    });
    logger.info(`${channel.channelName} threadCount ${threadCount.count}`);

    const channelMembershipCount = await prisma.memberships.deleteMany({
      where: { channelsId: channel.id },
    });
    logger.info(
      `${channel.channelName} channelMembershipCount ${channelMembershipCount.count}`
    );
    const channelIntegrationsCount =
      await prisma.channelsIntegration.deleteMany({
        where: { channelId: channel.id },
      });
    logger.info(
      `${channel.channelName} channelIntegrationsCount ${channelIntegrationsCount.count}`
    );
    await prisma.channels.delete({
      where: { id: channel.id },
    });
  }
  logger.info(`channelsCount ${channels.length}`);

  const invitesCount = await prisma.invites.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info(`invitesCount ${invitesCount.count}`);

  const usersCount = await prisma.users.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info(`usersCount ${usersCount.count}`);

  const authsCount = await prisma.auths.updateMany({
    where: { accountId },
    data: { accountId: null },
  });
  logger.info(`authsCount ${authsCount.count}`);

  const slackCount = await prisma.slackAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info(`slackCount ${slackCount.count}`);

  const discordCount = await prisma.discordAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  logger.info(`discordCount ${discordCount.count}`);

  const apiKeys = await prisma.apiKeys.deleteMany({
    where: { accountId: accountId },
  });
  logger.info(`apiKeys ${apiKeys.count}`);

  const accountCount = await prisma.accounts.delete({
    where: { id: accountId },
  });
  logger.info(`accountCount ${accountCount.id}`);
}

async function processAttachments(attachments: messageAttachments[]) {
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
      console.error('%j', slice);
      throw error;
    }
  }
}
