import ApplicationMailer from '../mailers/ApplicationMailer';
import { updateAccountSyncStatus } from '../lib/models';
import { sendNotification, slackSync } from './slack';
import { SUPPORT_EMAIL } from 'secrets';
import {
  accounts,
  discordAuthorizations,
  slackAuthorizations,
  prisma,
} from '@linen/database';
import { discordSync } from './discord/sync';
import { slackSyncWithFiles } from './slack/syncWithFiles';
import { skipNotification } from './slack/api/notification';
import { getCommunityUrl } from 'serializers/account/settings';

export enum SyncStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export async function updateAndNotifySyncStatus(
  accountId: string,
  status: SyncStatus,
  accountName?: string | null,
  homeUrl?: string | null,
  communityUrl?: string | null
) {
  await updateAccountSyncStatus(accountId, status);

  await slackNotification(status, accountId, accountName || '', homeUrl || '', communityUrl || '');
  await emailNotification(status, accountId, accountName || '', homeUrl || '', communityUrl || '');
}

async function emailNotification(
  status: SyncStatus,
  accountId: string,
  accountName: string,
  homeUrl: string,
  communityUrl: string,
) {
  if (skipNotification()) return;
  try {
    await ApplicationMailer.send({
      to: SUPPORT_EMAIL,
      subject: `Linen.dev - Sync progress is ${status} for account: ${accountId}`,
      text: `Syncing process is ${status} for account:  ${accountId}, ${accountName}, ${homeUrl}, ${communityUrl}`,
      html: `Syncing process is ${status} for account:  ${accountId}, ${accountName}, ${homeUrl}, ${communityUrl}`,
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
  homeUrl: string,
  communityUrl: string,
) {
  try {
    await sendNotification(
      `Syncing process is ${status} for account: ${accountId}, ${accountName}, ${homeUrl}, ${communityUrl}.`
    );
  } catch (e) {
    console.error('Failed to send Slack notification: ', e);
  }
}

function identifySyncType(
  account:
    | (accounts & {
        slackAuthorizations: slackAuthorizations[];
        discordAuthorizations: discordAuthorizations[];
      })
    | null
) {
  if (account?.discordAuthorizations.length) {
    return discordSync;
  }
  if (account?.slackAuthorizations.length) {
    return slackSync;
  }
  throw 'authorization missing';
}

export type SyncJobType = {
  account_id: string;
  file_location?: string;
};

export async function syncJob({ account_id, file_location }: SyncJobType) {
  const accountId = account_id;
  const fileLocation = file_location;

  const account = await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
    include: {
      discordAuthorizations: true,
      slackAuthorizations: true,
    },
  });

  const syncFunction = fileLocation
    ? slackSyncWithFiles
    : identifySyncType(account);

  await syncFunction({
    accountId,
    fullSync: true, // discord only
    fileLocation,
  });
}
