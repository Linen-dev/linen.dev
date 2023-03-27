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

const linenSdk = new LinenSdk(
  env.INTERNAL_API_KEY,
  appendProtocol(getIntegrationUrl())
);

export async function onMessageCreate(message: Message) {
  console.log('onMessageCreate', message);

  if (message.nonce === nonce) {
    console.warn('message from linen');
    return;
  }

  if (!message.guildId) {
    console.warn('message does not have guild id');
    return;
  }

  if (filterMessageType(message)) {
    console.warn('message type not supported');
    return;
  }

  if (filterSupportedChannel(message.channel)) {
    console.warn('channel type not supported');
    return;
  }

  const linenAccount = await findAccount(message.guildId);
  if (!linenAccount) {
    console.warn('account not found');
    return;
  }

  const user = parseUser(message.author, message.member);
  const linenUser = await linenSdk.findOrCreateUser({
    accountsId: linenAccount.id,
    ...user,
  });

  let { thread, channel } = await parseChannelAndThread(message);

  if (!channel) {
    console.warn('channel not found');
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
      console.warn('thread not found');
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

  console.log('onMessageCreate success');
}

export async function onMessageDelete(message: Message | PartialMessage) {
  console.log('onMessageDelete', message);
}

export async function onMessageUpdate(message: Message | PartialMessage) {
  console.log('onMessageUpdate', message);
}

export async function onMessageReactionAdd(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.log('onMessageReactionAdd', reaction);
}

export async function onMessageReactionRemove(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.log('onMessageReactionRemove', reaction);
}

export async function onMessageReactionRemoveAll(
  message: Message<boolean> | PartialMessage
) {
  console.log('onMessageReactionRemoveAll', message);
}

export async function onMessageReactionRemoveEmoji(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.log('onMessageReactionRemoveEmoji', reaction);
}

export async function onChannelCreate(channel: NonThreadGuildBasedChannel) {
  console.log('onChannelCreate', channel);
}

export async function onChannelUpdate(
  channel: DMChannel | NonThreadGuildBasedChannel
) {
  console.log('onChannelUpdate', channel);
}

export async function onThreadCreate(thread: AnyThreadChannel<boolean>) {
  console.log('onThreadCreate', thread);
}

export async function onThreadDelete(thread: AnyThreadChannel<boolean>) {
  console.log('onThreadDelete', thread);
}

export async function onThreadUpdate(thread: AnyThreadChannel<boolean>) {
  console.log('onThreadUpdate', thread);
}

export async function onUserUpdate(user: User | PartialUser) {
  console.log('onUserUpdate', user);
}

export async function onGuildMemberAdd(member: GuildMember) {
  console.log('onGuildMemberAdd', member);
}

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember
) {
  console.log('onGuildMemberRemove', member);
}

export async function onGuildMemberUpdate(
  member: GuildMember | PartialGuildMember
) {
  console.log('onGuildMemberUpdate', member);
}
