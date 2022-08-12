import { findArgAndParse } from '../../utilities/processArgs';
import { slackSync } from '../../services/slack';
import { findSlackAccounts } from '../../lib/account';
import { captureExceptionAndFlush } from 'utilities/sentry';

async function runScript(
  account: { id: string },
  channelId?: string,
  domain?: string
) {
  await slackSync({
    accountId: account.id,
    channelId,
    domain,
  })
    .then(() => {
      console.log('Syncing done!', account);
    })
    .catch((err) => {
      console.error('Syncing error: ', err, account);
      return captureExceptionAndFlush(err);
    });
}

async function slackSyncScript() {
  const accountId = findArgAndParse('accountId');
  const channelId = findArgAndParse('channelId');
  const domain = findArgAndParse('domain');

  if (accountId) {
    await runScript({ id: accountId }, channelId, domain);
  } else {
    const slackAccounts = await findSlackAccounts();
    console.log({ slackAccounts });
    for (const account of slackAccounts) {
      await runScript(account);
    }
  }
}

slackSyncScript();
