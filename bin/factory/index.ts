import { createAuth, findAuth } from '../../lib/auth';
import { createAccount, findAccount } from '../../lib/account';
import { createChannel, findChannel } from '../../lib/channel';

export async function findOrCreateAccount({ domain }: { domain: string }) {
  return (
    (await findAccount({ redirectDomain: domain })) ||
    (await createAccount({
      homeUrl: `https://${domain}`,
      docsUrl: `https://${domain}/docs`,
      redirectDomain: domain,
      brandColor: '#00bcd4',
    }))
  );
}

export async function findOrCreateUser({
  email,
  accountId,
}: {
  email: string;
  accountId: string;
}) {
  return (
    (await findAuth({ email })) ||
    (await createAuth({
      email,
      password: 'password',
      accountId,
    }))
  );
}

export async function findOrCreateChannel({
  name,
  accountId,
}: {
  name: string;
  accountId: string;
}) {
  return (
    (await findChannel({ name, accountId })) ||
    (await createChannel({
      name,
      accountId,
      slackChannelId: 'slack-channel-id-1234',
    }))
  );
}
