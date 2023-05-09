import {
  parseUser,
  parseChannelAndThread,
  parseMessage,
  parseThreadFromMessage,
  parseGuildUser,
} from '../utils/parse';
import { nonce } from '../utils/constrains';
import { filterMessageType, filterSupportedChannel } from '../utils/filter';
import type { Message } from 'discord.js';
import { logger } from '@linen/logger';
import { linenSdk, findAccountByExternalId } from '../utils/linen';
import { MessageFormat } from '@linen/types';

export async function onMessageCreate(message: Message) {
  logger.info('onMessageCreate', message);

  if (message.nonce === nonce) {
    logger.warn('message from linen');
    return;
  }

  if (!message.guildId) {
    logger.warn('message does not have guild id');
    return;
  }

  if (filterMessageType(message)) {
    logger.warn('message type not supported');
    return;
  }

  if (filterSupportedChannel(message.channel)) {
    logger.warn('channel type not supported');
    return;
  }

  const linenAccount = await findAccountByExternalId(message.guildId);
  if (!linenAccount) {
    logger.warn('account not found');
    return;
  }

  const user = parseUser(message.author, message.member);
  const linenUser = await linenSdk.findOrCreateUser({
    accountsId: linenAccount.id,
    ...user,
  });

  let { thread, channel } = await parseChannelAndThread(message);

  if (!channel) {
    logger.warn('channel not found');
    return;
  }

  const linenChannel = await linenSdk.findOrCreateChannel({
    accountId: linenAccount.id,
    ...channel,
    hidden: linenAccount.newChannelsConfig === 'HIDDEN',
  });

  let threadOrReply: 'reply' | 'thread' = 'reply';
  if (!thread) {
    threadOrReply = 'thread';
    thread = parseThreadFromMessage(message);
  }

  const mentions = await Promise.all(
    message.mentions.members
      ? message.mentions.members.map(async (u) => {
          const user = parseGuildUser(u);
          return await linenSdk.findOrCreateUser({
            accountsId: linenAccount.id,
            ...user,
          });
        })
      : []
  );

  const parsedMessage = parseMessage(message);
  if (threadOrReply === 'reply') {
    const linenThread = await linenSdk.getThread({
      externalThreadId: thread.externalThreadId,
    });
    if (!linenThread) {
      logger.warn('thread not found');
      return;
    }
    await linenSdk.createNewMessage({
      accountId: linenAccount.id,
      authorId: linenUser.id,
      channelId: linenChannel.id,
      externalMessageId: parsedMessage.externalMessageId,
      body: parsedMessage.body,
      threadId: linenThread.id,
      mentions,
      messageFormat: MessageFormat.DISCORD,
    });
  }
  if (threadOrReply === 'thread') {
    await linenSdk.createNewThread({
      accountId: linenAccount.id,
      authorId: linenUser.id,
      channelId: linenChannel.id,
      externalThreadId: thread.externalThreadId,
      body: parsedMessage.body,
      title: thread.title || undefined,
      mentions,
      messageFormat: MessageFormat.DISCORD,
    });
  }

  logger.info('onMessageCreate success');
}
