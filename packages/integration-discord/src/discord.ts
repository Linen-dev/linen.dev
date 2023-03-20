import {
  findAccount,
  findOrCreateChannel,
  findOrCreateMessage,
  findOrCreateThread,
  findOrCreateUser,
} from './linen';
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

export async function onMessageCreate(message: Message) {
  console.log('message', message);

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
  const linenUser = await findOrCreateUser(linenAccount, user);

  let { thread, channel } = await parseChannelAndThread(message);

  if (!channel) {
    console.warn('channel not found');
    return;
  }

  const linenChannel = await findOrCreateChannel(linenAccount, channel);

  if (!thread) {
    // build thread from single
    thread = parseThreadFromMessage(message);
  }

  const linenThread = await findOrCreateThread(linenChannel, thread);

  message.mentions.members;
  const mentions = await Promise.all(
    message.mentions.members
      ? message.mentions.members.map(async (u) => {
          const user = parseGuildUser(u);
          return await findOrCreateUser(linenAccount, user);
        })
      : []
  );

  const reply = parseMessage(message);
  await findOrCreateMessage(reply, linenThread, linenUser, mentions);

  console.log('onMessageCreate success');
}

export async function onMessageDelete(message: Message | PartialMessage) {
  console.log('message', message);
}

export async function onMessageUpdate(message: Message | PartialMessage) {
  console.log('message', message);
}

export async function onMessageReactionAdd(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.log('reaction', reaction);
}

export async function onMessageReactionRemove(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.log('reaction', reaction);
}

export async function onMessageReactionRemoveAll(
  message: Message<boolean> | PartialMessage
) {
  console.log('message', message);
}

export async function onMessageReactionRemoveEmoji(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.log('reaction', reaction);
}

export async function onChannelCreate(channel: NonThreadGuildBasedChannel) {
  console.log('channel', channel);
}

export async function onChannelUpdate(
  channel: DMChannel | NonThreadGuildBasedChannel
) {
  console.log('channel', channel);
}

export async function onThreadCreate(thread: AnyThreadChannel<boolean>) {
  console.log('thread', thread);
}

export async function onThreadDelete(thread: AnyThreadChannel<boolean>) {
  console.log('thread', thread);
}

export async function onThreadUpdate(thread: AnyThreadChannel<boolean>) {
  console.log('thread', thread);
}

export async function onUserUpdate(user: User | PartialUser) {
  console.log('user', user);
}

export async function onGuildMemberAdd(member: GuildMember) {
  console.log('member', member);
}

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember
) {
  console.log('member', member);
}

export async function onGuildMemberUpdate(
  member: GuildMember | PartialGuildMember
) {
  console.log('member', member);
}
