import { createAuth, findAuth } from '../../lib/auth';
import { createAccount, findAccount } from '../../lib/account';
import { createChannel, findChannel } from '../../lib/channel';
import { createThread, findThread } from '../../lib/thread';
import { createMessage, findMessage } from '../../lib/message';

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

export async function findOrCreateThread({
  channelId,
  slug,
}: {
  channelId: string;
  slug: string;
}) {
  return (
    (await findThread({ channelId, slug })) ||
    (await createThread({
      channelId,
      messageCount: 2,
      slackThreadTs: `slack-thread-ts-${slug}`,
      slug,
    }))
  );
}

export async function findOrCreateMessage({
  channelId,
  threadId,
  body,
}: {
  channelId: string;
  threadId: string;
  body: string;
}) {
  return (
    (await findMessage({ channelId, threadId, body })) ||
    (await createMessage({
      channelId,
      threadId,
      body,
    }))
  );
}
