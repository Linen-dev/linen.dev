import { slackSync } from '../../services/slack';
import { findSlackAccounts } from '../../lib/account';
import { captureException, flush } from '@sentry/nextjs';
import { findArgAndParse, findBoolArg } from 'utilities/processArgs';

async function runScript(
  account: { id: string },
  {
    channelId,
    domain,
    skipUsers,
    fullSync,
  }: {
    channelId?: string;
    skipUsers?: boolean;
    domain?: string;
    fullSync?: boolean;
  }
) {
  await slackSync({
    accountId: account.id,
    channelId,
    domain,
    fullSync,
    skipUsers,
  })
    .then(() => {
      console.log('Syncing done!', account);
    })
    .catch((err) => {
      console.error('Syncing error: ', err, account);
      captureException(err);
      return flush(2000);
    });
}

async function slackSyncScript() {
  const accountId = findArgAndParse('accountId');
  const channelId = findArgAndParse('channelId');
  const domain = findArgAndParse('domain');
  const skipUsers = findBoolArg('skipUsers');
  const fullSync = findBoolArg('fullSync');

  if (accountId) {
    await runScript(
      { id: accountId },
      { channelId, domain, skipUsers, fullSync }
    );
  } else {
    const slackAccounts = await findSlackAccounts();
    console.log({ slackAccounts });
    for (const account of slackAccounts) {
      await runScript(account, {});
    }
  }
}

slackSyncScript();
