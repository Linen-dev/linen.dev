import { SyncStatus, updateAndNotifySyncStatus } from 'services/sync';
import { listChannelsAndPersist } from './channels';
import { CrawlType, DISCORD_TOKEN } from './constrains';
import { crawlUsers } from './users';
import { decrypt } from 'utilities/crypto';
import { getMessages } from './messages';
import { getActiveThreads, getArchivedThreads } from './threads';
import Logger from './logger';
import { accounts, discordAuthorizations, prisma } from '@linen/database';

async function syncJob(
  account: accounts & {
    discordAuthorizations: discordAuthorizations[];
  },
  crawlType: CrawlType,
  decodeBotToken: (accessToken: string) => string,
  logger: Logger
) {
  logger.log(`sync stared: ${crawlType}`);

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

  logger.log(`onboardingTimestamp: ${onboardingTimestamp}`);

  const token = discordAuthorizations?.customBot
    ? decodeBotToken(discordAuthorizations.accessToken)
    : DISCORD_TOKEN;

  // avoid run it on new_only executions
  if (crawlType === CrawlType.historic) {
    await crawlUsers({
      accountId: account.id,
      serverId: account.discordServerId,
      token,
      logger,
    });
  }

  const channels = await listChannelsAndPersist({
    serverId: account.discordServerId,
    accountId: account.id,
    token,
    logger,
  });

  // active threads are global (not channel specific)
  await getActiveThreads({
    serverId: account.discordServerId,
    token,
    crawlType,
    onboardingTimestamp,
    logger,
  });

  if (channels?.length) {
    logger.log(`channels found: ${channels.length}`);
    for (const channel of channels) {
      logger.log(channel.channelName + ' channel tasks started');
      if ([CrawlType.historic, CrawlType.from_onboarding].includes(crawlType)) {
        // this will force sync all messages until reach onboardingTimestamp,
        channel.externalPageCursor = null;
      }
      await getArchivedThreads({
        channel,
        token,
        crawlType,
        onboardingTimestamp,
        logger,
      });
      await getMessages({ channel, onboardingTimestamp, token, logger });
      logger.log(channel.channelName + ' channel tasks finished');
    }
  }

  logger.log('sync finished');
}

export async function discordSync(args: {
  accountId: string;
  fullSync?: boolean;
}) {
  try {
    const crawlType = !args.fullSync ? CrawlType.new_only : CrawlType.historic;

    const account = await prisma.accounts.findUnique({
      where: { id: args.accountId },
      include: {
        discordAuthorizations: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!account) {
      throw new Error('account not found');
    }

    // TODO: add more data
    await updateAndNotifySyncStatus(args.accountId, SyncStatus.IN_PROGRESS);

    const logger = new Logger(getAccountName(account));
    await syncJob(account, crawlType, decrypt, logger);

    // TODO: add more data
    await updateAndNotifySyncStatus(args.accountId, SyncStatus.DONE);

    return args;
  } catch (error) {
    // TODO: add error
    await updateAndNotifySyncStatus(args.accountId, SyncStatus.ERROR);
    throw error;
  }
}

function getAccountName(account: accounts): string {
  return (
    account.name || account.redirectDomain || account.slackDomain || account.id
  );
}
