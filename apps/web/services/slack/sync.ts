import { findAccountById } from 'lib/models';
import { SyncStatus, updateAndNotifySyncStatus } from 'services/sync';
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

export async function slackSync({
  accountId,
  channelId,
  domain,
  fullSync,
  skipUsers = false,
}: {
  accountId: string;
  channelId?: string;
  domain?: string;
  fullSync?: boolean | undefined;
  skipUsers?: boolean;
}) {
  console.log(new Date(), { fullSync });

  const account = await findAccountById(accountId);

  if (!account) {
    throw new Error('Account not found');
  }
  if (!account.slackTeamId) {
    throw new Error('slackTeamId not found');
  }

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
  } catch (err) {
    console.error(err);

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
      error: String(err),
    };
  } finally {
    console.log('sync finished at', new Date());
  }
}
