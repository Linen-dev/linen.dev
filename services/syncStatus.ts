import ApplicationMailer from '../mailers/ApplicationMailer';
import { updateAccountSlackSyncStatus } from '../lib/models';
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
  try {
    await ApplicationMailer.send({
      to: 'kam@linen.dev', // TODO: get proper email
      subject: `Linen.dev - Sync progress is ${status} for account: ${accountId}`,
      text: `Syncing process is ${status} for account: ${accountId}`,
      html: `Syncing process is ${status} for account: ${accountId}`,
    }).catch((err) => {
      console.log('Failed to send Email notification', err);
    });
  } catch (error) {
    console.error(error);
  }
}
