import { Logger, TwoWaySyncType } from '@linen/types';
import {
  findAccountById,
  findChannelById,
  findIntegrationByAccountId,
  findThreadWithMessage,
  setMessageExternalId,
  setThreadExternalId,
} from './utils/linen';
import { getTokenByIntegration } from './utils/token';
import { Routes } from 'discord.js';
import { discordChannelType, nonce } from './utils/constrains';
import { getClient } from './utils/rest';

export async function processDiscordIntegration({
  event,
  channelId,
  messageId,
  threadId,
  logger,
}: TwoWaySyncType & { logger: Logger }) {
  if (!channelId || !messageId || !threadId) {
    return 'missing ids';
  }

  const channel = await findChannelById(channelId);
  if (!channel) {
    logger.warn({ cause: 'channel not found' });
    return;
  }
  if (!channel.accountId) {
    logger.warn({ cause: 'channel does not have account' });
    return;
  }

  if (!channel.externalChannelId) {
    logger.warn({ cause: 'channel does not have external id' });
    return;
  }

  const account = await findAccountById(channel.accountId);
  if (!account) {
    logger.warn({ cause: 'account not found' });
    return;
  }

  const integration = await findIntegrationByAccountId(account.id);
  if (!integration) {
    logger.warn({ cause: 'account does not have discord integration' });
    return;
  }

  const token = getTokenByIntegration(integration);

  const thread = await findThreadWithMessage(threadId);
  if (!thread) {
    logger.warn({ cause: 'thread not found' });
    return;
  }
  if (!thread.messages.length) {
    logger.warn({ cause: 'thread without messages' });
    return;
  }

  const message = messageId
    ? thread.messages.find((m) => m.id === messageId)
    : thread.messages.shift();
  if (!message) {
    logger.warn({ cause: 'message not found in thread' });
    return;
  }

  const body = [
    message.body,
    ...message.attachments.map((a) => a.internalUrl),
  ].join('\n');

  switch (event) {
    case 'newThread':
      if (thread.externalThreadId) {
        return;
      }

      await processNewThread({
        token,
        externalChannelId: channel.externalChannelId,
        body,
        title: thread.title || undefined,
        author:
          message.author?.externalUserId ||
          message.author?.displayName ||
          'user',
        setThreadExternalId: (externalId) =>
          setThreadExternalId(threadId, externalId),
        setMessageExternalId: (externalId) =>
          setMessageExternalId(messageId, externalId),
      });

      return;

    case 'newMessage':
      if (!thread.externalThreadId) {
        logger.warn({ cause: 'thread does not have external id' });
        return;
      }
      if (message.externalMessageId) {
        return;
      }

      await processNewMessage({
        token,
        externalThreadId: thread.externalThreadId,
        externalChannelId: channel.externalChannelId,
        body,
        author:
          message.author?.externalUserId ||
          message.author?.displayName ||
          'user',
        title:
          thread.title || thread.messages.length
            ? thread.messages[0].body
            : 'Thread',

        setThreadExternalId: (externalId) =>
          setThreadExternalId(threadId, externalId),
        setMessageExternalId: (externalId) =>
          setMessageExternalId(messageId, externalId),
      });

      return;

    default:
      break;
  }
}

async function processNewThread({
  token,
  externalChannelId,
  body,
  title,
  author,
  setThreadExternalId,
  setMessageExternalId,
}: {
  setThreadExternalId: (externalId: string) => Promise<void>;
  setMessageExternalId: (externalId: string) => Promise<void>;
  token: string;
  externalChannelId: string;
  body: string;
  title?: string;
  author?: string;
}) {
  const client = await getClient(token);
  const thread: any = await client.post(Routes.threads(externalChannelId), {
    body: {
      name: title || body.substring(0, 15),
      type: discordChannelType.PUBLIC_THREAD,
      message: {
        content: `${author}: ${body}`,
        nonce,
      },
      nonce,
    },
  });
  await setThreadExternalId(thread.id);

  if (thread.message) {
    await setMessageExternalId(thread.message.id);
    return;
  }

  const message: any = await client.post(Routes.channelMessages(thread.id), {
    body: { content: `${author}: ${body}`, nonce },
  });
  await setMessageExternalId(message.id);
  return;
}

async function processNewMessage({
  token,
  externalThreadId,
  externalChannelId,
  body,
  author,
  title,
  setThreadExternalId,
  setMessageExternalId,
}: {
  setThreadExternalId: (externalId: string) => Promise<void>;
  setMessageExternalId: (externalId: string) => Promise<void>;
  token: string;
  externalThreadId: string;
  externalChannelId: string;
  body: string;
  author?: string;
  title: string;
}) {
  const client = await getClient(token);

  const thread: any = await client
    .post(Routes.threads(externalChannelId, externalThreadId), {
      body: { name: title, nonce },
    })
    .catch(() => null);

  if (thread) {
    await setThreadExternalId(thread.id);
  }

  const message: any = await client.post(
    Routes.channelMessages(thread ? thread.id : externalThreadId),
    {
      body: { content: `${author}: ${body}`, nonce },
    }
  );
  await setMessageExternalId(message.id);
  return;
}
