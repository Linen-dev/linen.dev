import { SyncStatus, updateAndNotifySyncStatus } from '../sync';
import prisma from '../../client';
import { listChannelsAndPersist } from './channels';
import { processChannel } from './channels';
import { CrawlType, DISCORD_TOKEN } from './constrains';
import { crawlUsers } from './users';
import { hideEmptyChannels } from '../../lib/channel';

async function syncJob(accountId: string, crawlType: CrawlType) {
  console.log('sync stared', { accountId, crawlType });

  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
    include: {
      discordAuthorizations: { take: 1, orderBy: { createdAt: 'asc' } },
    },
  });

  // for a full sync, aka historic fetch, we should use onboardingTimestamp as new Date(0)
  // also we need to clean up all channels cursors
  const onboardingTimestamp = [CrawlType.historic].includes(crawlType)
    ? new Date(0)
    : account?.discordAuthorizations.shift()?.createdAt ||
      account?.createdAt ||
      new Date();

  console.log({ onboardingTimestamp });

  await crawlUsers(accountId, account?.discordServerId as string);

  const channels = await listChannelsAndPersist({
    serverId: account?.discordServerId as string,
    accountId,
    token: DISCORD_TOKEN,
  });

  console.log({ channels: channels.length });
  for (const channel of channels) {
    // look for new threads and new single messages
    if ([CrawlType.historic, CrawlType.from_onboarding].includes(crawlType)) {
      // this will force sync all messages until reach onboardingTimestamp,
      channel.externalPageCursor = null;
    }
    await processChannel(channel, onboardingTimestamp, crawlType);
  }
  await hideEmptyChannels(accountId);
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

    await syncJob(accountId, crawlType);

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
