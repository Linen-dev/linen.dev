import { findAccountById } from 'services/accounts';
import { SyncStatus, updateAndNotifySyncStatus } from 'services/accounts/sync';
import {
  fetchTeamInfo,
  fetchReplies,
  joinChannel,
  listUsers,
  fetchConversationsTyped,
  getSlackChannels,
  getMemberships,
} from './api';
import { syncWrapper } from './syncWrapper';
import { Logger } from '@linen/types';

export async function slackSync({
  accountId,
  channelId,
  domain,
  fullSync,
  skipUsers = false,
  logger,
}: {
  accountId: string;
  channelId?: string;
  domain?: string;
  fullSync?: boolean | undefined;
  skipUsers?: boolean;
  logger: Logger;
}) {
  logger.log({ startAt: new Date(), fullSync });

  const account = await findAccountById(accountId);

  if (!account) {
    throw new Error('Account not found');
  }
  if (!account.slackTeamId) {
    throw new Error('slackTeamId not found');
  }

  logger.setPrefix(account.slackDomain || account.name || account.id);

  await updateAndNotifySyncStatus({
    accountId,
    status: SyncStatus.IN_PROGRESS,
    accountName: account.name,
    homeUrl: account.homeUrl,
    communityUrl: account.communityUrl,
    pathDomain: account.slackDomain,
  });

  try {
    await syncWrapper({
      account,
      domain,
      accountId,
      channelId,
      skipUsers,
      fullSync,
      fetchConversationsTyped,
      fetchReplies,
      fetchTeamInfo,
      getSlackChannels,
      joinChannel,
      listUsers,
      getMemberships,
      logger,
    });

    await updateAndNotifySyncStatus({
      accountId,
      status: SyncStatus.DONE,
      accountName: account.name,
      homeUrl: account.homeUrl,
      communityUrl: account.communityUrl,
      pathDomain: account.slackDomain,
    });

    return {
      status: 200,
      body: {},
    };
  } catch (error) {
    logger.error({ error });

    await updateAndNotifySyncStatus({
      accountId,
      status: SyncStatus.ERROR,
      accountName: account.name,
      homeUrl: account.homeUrl,
      communityUrl: account.communityUrl,
      pathDomain: account.slackDomain,
    });

    throw {
      status: 500,
      error: String(error),
    };
  } finally {
    logger.log({ finishedAt: new Date() });
  }
}
