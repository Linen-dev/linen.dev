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

  if (!account || !account.slackTeamId) {
    throw { status: 404, error: 'Account not found' };
  }

  await updateAndNotifySyncStatus(
    accountId,
    SyncStatus.IN_PROGRESS,
    account.name,
    account.homeUrl
  );

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

    await updateAndNotifySyncStatus(
      accountId,
      SyncStatus.DONE,
      account.name,
      account.homeUrl
    );

    return {
      status: 200,
      body: {},
    };
  } catch (err) {
    console.error(err);

    await updateAndNotifySyncStatus(
      accountId,
      SyncStatus.ERROR,
      account.name,
      account.homeUrl
    );

    throw {
      status: 500,
      error: String(err),
    };
  } finally {
    console.log('sync finished at', new Date());
  }
}
