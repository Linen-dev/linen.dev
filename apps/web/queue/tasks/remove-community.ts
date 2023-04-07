import type { JobHelpers } from 'graphile-worker';
import type { TaskInterface } from 'queue';
import { prisma, messageAttachments } from '@linen/database';
import { deleteFiles } from 'services/aws/s3';
import { sendNotification } from 'services/slack';

export const removeCommunity: TaskInterface = async (
  payload: { accountId: string },
  helpers: JobHelpers
) => {
  helpers.logger.info(JSON.stringify(payload));
  await sendNotification(
    `[INFO] Remove account ${payload.accountId} process started`
  );
  try {
    await cleanUp(payload.accountId, helpers.logger.info);
    await sendNotification(
      `[INFO] Remove account ${payload.accountId} process finished`
    );
  } catch (error) {
    await sendNotification(
      `[ERROR] Remove account ${payload.accountId} process failed`
    );
    console.error(error)
    throw error;
  }
};

export async function cleanUp(
  accountId: string,
  log: (message: string) => void
) {
  const channels = await prisma.channels.findMany({ where: { accountId } });

  for (const channel of channels) {
    log(channel.channelName);

    const mentionsCount = await prisma.mentions.deleteMany({
      where: { messages: { channelId: channel.id } },
    });
    log(`${channel.channelName} mentionsCount ${mentionsCount.count}`);
    const attachments = await prisma.messageAttachments.findMany({
      where: { messages: { channelId: channel.id } },
    });
    log(`${channel.channelName} attachments ${attachments.length}`);
    await processAttachments(attachments);

    const messageCount = await prisma.messages.deleteMany({
      where: { channelId: channel.id },
    });
    log(`${channel.channelName} messageCount ${messageCount.count}`);
    const threadCount = await prisma.threads.deleteMany({
      where: { channel: { id: channel.id } },
    });
    log(`${channel.channelName} threadCount ${threadCount.count}`);

    const channelMembershipCount = await prisma.memberships.deleteMany({
      where: { channelsId: channel.id },
    });
    log(
      `${channel.channelName} channelMembershipCount ${channelMembershipCount.count}`
    );
    await prisma.channels.delete({
      where: { id: channel.id },
    });
  }
  log(`channelsCount ${channels.length}`);

  const invitesCount = await prisma.invites.deleteMany({
    where: { accountsId: accountId },
  });
  log(`invitesCount ${invitesCount.count}`);

  const usersCount = await prisma.users.deleteMany({
    where: { accountsId: accountId },
  });
  log(`usersCount ${usersCount.count}`);

  const authsCount = await prisma.auths.updateMany({
    where: { accountId },
    data: { accountId: null },
  });
  log(`authsCount ${authsCount.count}`);

  const slackCount = await prisma.slackAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  log(`slackCount ${slackCount.count}`);

  const discordCount = await prisma.discordAuthorizations.deleteMany({
    where: { accountsId: accountId },
  });
  log(`discordCount ${discordCount.count}`);

  const accountCount = await prisma.accounts.delete({
    where: { id: accountId },
  });
  log(`accountCount ${accountCount.id}`);
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
