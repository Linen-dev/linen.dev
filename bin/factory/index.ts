import { createAuth, findAuth } from '../../lib/auth';
import { createAccount, findAccount } from '../../lib/account';
import { createChannel, findChannel } from '../../lib/channel';
import { createThread, findThread } from '../../lib/thread';
import { createMessage, findMessage } from '../../lib/message';
import { createUser, findUser } from '../../lib/user';
import { random } from '../../utilities/string';

export async function findOrCreateAccount({
  domain,
  logoUrl,
}: {
  domain: string;
  logoUrl?: string;
}) {
  return (
    (await findAccount({ redirectDomain: domain, logoUrl })) ||
    (await createAccount({
      homeUrl: `https://${domain}`,
      docsUrl: `https://${domain}/docs`,
      redirectDomain: domain,
      brandColor: '#00bcd4',
      logoUrl,
    }))
  );
}

export async function findOrCreateUser({
  accountsId,
  slackUserId,
}: {
  accountsId: string;
  slackUserId: string;
}) {
  return (
    (await findUser({ accountsId, slackUserId })) ||
    (await createUser({
      accountsId,
      slackUserId,
    }))
  );
}

export async function findOrCreateAuth({
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
      slackChannelId: `slack-channel-id-${random()}`,
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
  usersId,
}: {
  channelId: string;
  threadId: string;
  body: string;
  usersId?: string;
}) {
  return (
    (await findMessage({ channelId, threadId, body, usersId })) ||
    (await createMessage({
      slackMessageId: random(),
      channelId,
      threadId,
      body,
      usersId,
    }))
  );
}
