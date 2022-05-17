import { updateAccountSlackSyncStatus } from 'lib/models';
import { sendNotification } from './slack';

export enum SyncStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export async function updateAndNotifySyncStatus(
  accountId: string,
  status: SyncStatus
) {
  await updateAccountSlackSyncStatus(accountId, status);
  try {
    await sendNotification(
      `Syncing process is ${status} for account: ${accountId}.`
    );
  } catch (e) {
    console.error('Failed to send Slack notification: ', e);
  }
}
