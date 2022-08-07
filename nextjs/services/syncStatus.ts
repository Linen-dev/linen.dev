import ApplicationMailer from '../mailers/ApplicationMailer';
import { updateAccountSyncStatus } from '../lib/models';
import { sendNotification } from './slack';

export enum SyncStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export async function updateAndNotifySyncStatus(
  accountId: string,
  status: SyncStatus,
  accountName?: string | null,
  homeUrl?: string | null
) {
  await updateAccountSyncStatus(accountId, status);

  if (skipNotification()) return;

  await slackNotification(status, accountId, accountName || '', homeUrl || '');
  await emailNotification(status, accountId, accountName || '', homeUrl || '');
}

async function emailNotification(
  status: SyncStatus,
  accountId: string,
  accountName: string,
  homeUrl: string
) {
  try {
    await ApplicationMailer.send({
      to: (process.env.SUPPORT_EMAIL || 'help@linen.dev') as string,
      subject: `Linen.dev - Sync progress is ${status} for account: ${accountId}`,
      text: `Syncing process is ${status} for account:  ${accountId}, ${accountName}, ${homeUrl}`,
      html: `Syncing process is ${status} for account:  ${accountId}, ${accountName}, ${homeUrl}`,
    }).catch((err) => {
      console.log('Failed to send Email notification', err);
    });
  } catch (error) {
    console.error(error);
  }
}

async function slackNotification(
  status: SyncStatus,
  accountId: string,
  accountName: string,
  homeUrl: string
) {
  try {
    await sendNotification(
      `Syncing process is ${status} for account: ${accountId}, ${accountName}, ${homeUrl}.`
    );
  } catch (e) {
    console.error('Failed to send Slack notification: ', e);
  }
}

function skipNotification() {
  return process.env.SKIP_NOTIFICATION === 'true';
}
