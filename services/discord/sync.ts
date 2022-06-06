import prisma from '../../client';
import { listChannelsAndPersist } from './channels';
import { processChannel } from './channels';
import { CrawlType, DISCORD_TOKEN } from './constrains';
import { crawlUsers } from './users';

// (async () => {
//   const accountId = '910dd004-8d31-4479-8c03-fee6d524641f';
//   const crawlType = CrawlType.new_only;
//   await syncJob(accountId, crawlType);
// })();

async function syncJob(accountId: string, crawlType: CrawlType) {
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

  for (const channel of channels) {
    // look for new threads and new single messages
    if ([CrawlType.historic, CrawlType.from_onboarding].includes(crawlType)) {
      // this will force sync all messages until reach onboardingTimestamp,
      channel.slackNextPageCursor = null;
    }
    await processChannel(channel, onboardingTimestamp, accountId, crawlType);
  }
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
    console.log('crawlType', crawlType);
    await syncJob(accountId, crawlType);
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      body: {},
    };
  }

  return {
    status: 200,
    body: {},
  };
}
