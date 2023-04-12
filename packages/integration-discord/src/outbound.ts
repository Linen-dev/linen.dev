import { TwoWaySyncType } from '@linen/types';
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
import { logger } from '@linen/logger';

export async function processDiscordIntegration({
  event,
  channelId,
  messageId,
  threadId,
}: TwoWaySyncType) {
  if (!channelId || !messageId || !threadId) {
    return 'missing ids';
  }

  const channel = await findChannelById(channelId);
  if (!channel) {
    logger.warn('channel not found');
    return;
  }
  if (!channel.accountId) {
    logger.warn('channel does not have account');
    return;
  }

  if (!channel.externalChannelId) {
    logger.warn('channel does not have external id');
    return;
  }

  const account = await findAccountById(channel.accountId);
  if (!account) {
    logger.warn('account not found');
    return;
  }

  const integration = await findIntegrationByAccountId(account.id);
  if (!integration) {
    logger.warn('account does not have discord integration');
    return;
  }

  const token = getTokenByIntegration(integration);

  const thread = await findThreadWithMessage(threadId);
  if (!thread) {
    logger.warn('thread not found');
    return;
  }
  if (!thread.messages.length) {
    logger.warn('thread without messages');
    return;
  }

  const message = messageId
    ? thread.messages.find((m) => m.id === messageId)
    : thread.messages.shift();
  if (!message) {
    logger.warn('message not found in thread');
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

      const { thread: externalThread, message: externalMessage } =
        await processNewThread({
          token,
          externalChannelId: channel.externalChannelId,
          body,
          title: thread.title || undefined,
          author:
            message.author?.externalUserId ||
            message.author?.displayName ||
            'user',
        });

      await setThreadExternalId(threadId, externalThread.id);
      await setMessageExternalId(messageId, externalMessage.id);

      return externalThread;

    case 'newMessage':
      if (!thread.externalThreadId) {
        logger.warn('thread does not have external id');
        return;
      }
      if (message.externalMessageId) {
        return;
      }

      const { thread: externalThread2, message: externalMessage2 } =
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
        });

      if (externalThread2) {
        await setThreadExternalId(threadId, externalThread2.id);
      }
      await setMessageExternalId(messageId, externalMessage2.id);

      return externalMessage2;

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
}: {
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
    },
  });

  if (thread.message) {
    return { thread, message: thread.message };
  }

  const message: any = await client.post(Routes.channelMessages(thread.id), {
    body: { content: `${author}: ${body}`, nonce },
  });

  return { thread, message };
}

async function processNewMessage({
  token,
  externalThreadId,
  externalChannelId,
  body,
  author,
  title,
}: {
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
      body: { name: title },
    })
    .catch(() => null);

  const message: any = await client.post(
    Routes.channelMessages(thread ? thread.id : externalThreadId),
    {
      body: { content: `${author}: ${body}`, nonce },
    }
  );
  return { message, thread };
}
