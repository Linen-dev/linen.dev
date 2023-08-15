import { updateAccountSyncStatus } from 'services/accounts';
import { sendNotification, slackSync } from 'services/slack';
import {
  accounts,
  discordAuthorizations,
  slackAuthorizations,
  prisma,
} from '@linen/database';
import { discordSync } from 'services/discord/sync';
import { slackSyncWithFiles } from 'services/slack/syncWithFiles';
import { Logger, Roles, SyncJobType } from '@linen/types';
import SyncMailer from 'mailers/SyncMailer';

export enum SyncStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export async function updateAndNotifySyncStatus({
  accountId,
  status,
  accountName,
  homeUrl,
  communityUrl,
  pathDomain,
}: {
  accountId: string;
  status: SyncStatus;
  accountName?: string | null;
  homeUrl?: string | null;
  communityUrl?: string | null;
  pathDomain: string | null;
}) {
  await updateAccountSyncStatus(accountId, status);

  await slackNotification({
    status,
    accountId,
    accountName: accountName || '',
    homeUrl: homeUrl || '',
    communityUrl: communityUrl || '',
    pathDomain,
  });

  await syncEmail({
    status,
    accountId,
    pathDomain,
  });
}

async function slackNotification({
  status,
  accountId,
  accountName,
  homeUrl,
  communityUrl,
  pathDomain,
}: {
  status: SyncStatus;
  accountId: string;
  accountName: string;
  homeUrl: string;
  communityUrl: string;
  pathDomain: string | null;
}) {
  try {
    await sendNotification(
      `[${status}] Syncing process is ${status} for account: ${JSON.stringify({
        accountId,
        accountName,
        homeUrl,
        communityUrl,
        url: `https://www.linen.dev/s/${pathDomain}`,
      })}`
    );
  } catch (e) {
    console.error('Failed to send Slack notification: ', e);
  }
}

async function syncEmail({
  status,
  accountId,
  pathDomain,
}: {
  status: SyncStatus;
  accountId: string;
  pathDomain: string | null;
}) {
  try {
    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
    });
    if (account) {
      const admins = await prisma.auths.findMany({
        where: {
          users: {
            some: {
              role: { in: [Roles.ADMIN, Roles.OWNER] },
              accountsId: account.id,
            },
          },
        },
        include: {
          users: true,
        },
      });
      if (admins.length > 0) {
        await Promise.all(
          admins.map(async (admin) => {
            if (status === SyncStatus.IN_PROGRESS) {
              return SyncMailer.start({ to: admin.email });
            }
            if (status === SyncStatus.DONE) {
              return SyncMailer.end({
                to: admin.email,
                url: `https://www.linen.dev/s/${pathDomain}`,
              });
            }
            if (status === SyncStatus.ERROR) {
              return SyncMailer.error({ to: admin.email });
            }
            return Promise.resolve();
          })
        );
      }
    }
  } catch (exception) {
    console.error('Failed to send sync emails: ', exception);
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

export async function syncJob({
  account_id,
  file_location,
  fullSync,
  logger,
}: SyncJobType & { logger: Logger }) {
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
    fullSync,
    fileLocation,
    logger,
  });
}
