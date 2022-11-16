import ApplicationMailer from '../mailers/ApplicationMailer';
import { updateAccountSyncStatus } from '../lib/models';
import { sendNotification, slackSync } from './slack';
import { SUPPORT_EMAIL } from 'secrets';
import {
  accounts,
  discordAuthorizations,
  slackAuthorizations,
  Prisma,
} from '@prisma/client';
import { discordSync } from './discord/sync';
import { slackSyncWithFiles } from './slack/syncWithFiles';
import prisma from '../client';
import { skipNotification } from './slack/api/notification';
import { slackChatSync } from './slack/api/postMessage';

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
      to: SUPPORT_EMAIL,
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

export type ChatSyncJobType = {
  channelId: string;
  threadId: string;
  messageId: string;
  isThread?: boolean;
  isReply?: boolean;
};

const include = Prisma.validator<Prisma.channelsArgs>()({
  include: {
    account: {
      include: { slackAuthorizations: true, discordAuthorizations: true },
    },
  },
});

export type ChannelWithAccountAndAuthorizations = Prisma.channelsGetPayload<
  typeof include
>;

export async function chatSyncJob({
  channelId,
  messageId,
  threadId,
  isThread,
  isReply,
}: ChatSyncJobType) {
  console.log({ isThread, isReply });

  const channel = await prisma.channels.findFirst({
    where: {
      id: channelId,
    },
    ...include,
  });

  if (!channel) {
    return 'channel not found';
  }
  if (!channel.account) {
    return 'account not found';
  }
  if (!channel.externalChannelId) {
    return 'channel belongs to linen';
  }
  // check if is slack
  if (channel.account.slackAuthorizations.length) {
    return slackChatSync({ channel, threadId, messageId, isThread, isReply });
  }
  // check if is discord
  if (channel.account.discordAuthorizations.length) {
    return 'discord is not implemented yet';
  }

  return 'account without authorization';
}
