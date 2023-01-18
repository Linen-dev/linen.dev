import { SyncStatus, updateAndNotifySyncStatus } from 'services/sync';
import prisma from 'client';
import { listChannelsAndPersist } from './channels';
import { CrawlType, DISCORD_TOKEN } from './constrains';
import { crawlUsers } from './users';
import { decrypt } from 'utilities/crypto';
import { getMessages } from './messages';
import { getActiveThreads, getArchivedThreads } from './threads';

async function syncJob(
  accountId: string,
  crawlType: CrawlType,
  decodeBotToken: (accessToken: string) => string
) {
  console.log('sync stared', { accountId, crawlType });

  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
    include: {
      discordAuthorizations: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!account) {
    throw new Error('account not found');
  }
  if (!account.discordServerId) {
    throw new Error('discord server id not found');
  }
  if (!account.discordAuthorizations || !account.discordAuthorizations.length) {
    throw new Error('discord authorization not found');
  }

  const discordAuthorizations = account.discordAuthorizations.find(Boolean);

  // for a full sync, aka historic fetch, we should use onboardingTimestamp as new Date(0)
  // also we need to clean up all channels cursors
  const onboardingTimestamp = [CrawlType.historic].includes(crawlType)
    ? new Date(0)
    : discordAuthorizations?.createdAt || account.createdAt || new Date();

  console.log({ onboardingTimestamp });

  const token = discordAuthorizations?.customBot
    ? decodeBotToken(discordAuthorizations.accessToken)
    : DISCORD_TOKEN;

  await crawlUsers({
    accountId,
    serverId: account.discordServerId,
    token,
  });

  const channels = await listChannelsAndPersist({
    serverId: account.discordServerId,
    accountId,
    token,
  });

  // active threads are global (not channel specific)
  await getActiveThreads({
    serverId: account.discordServerId,
    token,
    crawlType,
    onboardingTimestamp,
  });

  if (channels?.length) {
    console.log({ channels: channels.length });
    for (const channel of channels) {
      console.log(channel.channelName + ' channel tasks started');
      if ([CrawlType.historic, CrawlType.from_onboarding].includes(crawlType)) {
        // this will force sync all messages until reach onboardingTimestamp,
        channel.externalPageCursor = null;
      }
      await getArchivedThreads({
        channel,
        token,
        crawlType,
        onboardingTimestamp,
      });
      await getMessages({ channel, onboardingTimestamp, crawlType, token });
      console.log(channel.channelName + ' channel tasks finished');
    }
  }

  console.log('sync finished', { accountId });
}

export async function discordSync({
  accountId,
  fullSync = false,
}: {
  accountId: string;
  fullSync?: boolean;
}) {
  try {
    const crawlType = fullSync ? CrawlType.historic : CrawlType.new_only;
    await updateAndNotifySyncStatus(accountId, SyncStatus.IN_PROGRESS);

    await syncJob(accountId, crawlType, decrypt);

    await updateAndNotifySyncStatus(accountId, SyncStatus.DONE);
    return {
      status: 200,
      body: {},
    };
  } catch (error) {
    await updateAndNotifySyncStatus(accountId, SyncStatus.ERROR);
    throw error;
  }
}
