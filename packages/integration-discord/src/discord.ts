import { findAccount } from './linen';
import {
  parseUser,
  parseChannelAndThread,
  parseMessage,
  parseThreadFromMessage,
  parseGuildUser,
} from './utils/parse';
import { nonce } from './utils/constrains';
import { filterMessageType, filterSupportedChannel } from './utils/filter';
import type {
  Message,
  PartialMessage,
  MessageReaction,
  PartialMessageReaction,
  NonThreadGuildBasedChannel,
  AnyThreadChannel,
  DMChannel,
  User,
  PartialUser,
  GuildMember,
  PartialGuildMember,
} from 'discord.js';
import LinenSdk from '@linen/sdk';
import env from './utils/config';
import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import { logger } from '@linen/logger';

const linenSdk = new LinenSdk(
  env.INTERNAL_API_KEY,
  appendProtocol(getIntegrationUrl())
);

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

  const linenAccount = await findAccount(message.guildId);
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
    });
  }

  logger.info('onMessageCreate success');
}

export async function onMessageDelete(message: Message | PartialMessage) {
  logger.info('onMessageDelete', message);
}

export async function onMessageUpdate(message: Message | PartialMessage) {
  logger.info('onMessageUpdate', message);
}

export async function onMessageReactionAdd(
  reaction: MessageReaction | PartialMessageReaction
) {
  logger.info('onMessageReactionAdd', reaction);
}

export async function onMessageReactionRemove(
  reaction: MessageReaction | PartialMessageReaction
) {
  logger.info('onMessageReactionRemove', reaction);
}

export async function onMessageReactionRemoveAll(
  message: Message<boolean> | PartialMessage
) {
  logger.info('onMessageReactionRemoveAll', message);
}

export async function onMessageReactionRemoveEmoji(
  reaction: MessageReaction | PartialMessageReaction
) {
  logger.info('onMessageReactionRemoveEmoji', reaction);
}

export async function onChannelCreate(channel: NonThreadGuildBasedChannel) {
  logger.info('onChannelCreate', channel);
}

export async function onChannelUpdate(
  channel: DMChannel | NonThreadGuildBasedChannel
) {
  logger.info('onChannelUpdate', channel);
}

export async function onThreadCreate(thread: AnyThreadChannel<boolean>) {
  logger.info('onThreadCreate', thread);
}

export async function onThreadDelete(thread: AnyThreadChannel<boolean>) {
  logger.info('onThreadDelete', thread);
}

export async function onThreadUpdate(thread: AnyThreadChannel<boolean>) {
  logger.info('onThreadUpdate', thread);
}

export async function onUserUpdate(user: User | PartialUser) {
  logger.info('onUserUpdate', user);
}

export async function onGuildMemberAdd(member: GuildMember) {
  logger.info('onGuildMemberAdd', member);
}

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember
) {
  logger.info('onGuildMemberRemove', member);
}

export async function onGuildMemberUpdate(
  member: GuildMember | PartialGuildMember
) {
  logger.info('onGuildMemberUpdate', member);
}
