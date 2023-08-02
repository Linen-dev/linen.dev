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

export { onMessageCreate } from './onMessageCreate';
export { onMessageDelete } from './onMessageDelete';
export { onMessageUpdate } from './onMessageUpdate';
export { onThreadUpdate } from './onThreadUpdate';
export { onThreadCreate } from './onThreadCreate';

export async function onMessageReactionAdd(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.info('onMessageReactionAdd', reaction);
}

export async function onMessageReactionRemove(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.info('onMessageReactionRemove', reaction);
}

export async function onMessageReactionRemoveAll(
  message: Message<boolean> | PartialMessage
) {
  console.info('onMessageReactionRemoveAll', message);
}

export async function onMessageReactionRemoveEmoji(
  reaction: MessageReaction | PartialMessageReaction
) {
  console.info('onMessageReactionRemoveEmoji', reaction);
}

export async function onChannelCreate(channel: NonThreadGuildBasedChannel) {
  console.info('onChannelCreate', channel);
}

export async function onChannelUpdate(
  channel: DMChannel | NonThreadGuildBasedChannel
) {
  console.info('onChannelUpdate', channel);
}

export async function onThreadDelete(thread: AnyThreadChannel<boolean>) {
  console.info('onThreadDelete', thread);
}

export async function onUserUpdate(user: User | PartialUser) {
  console.info('onUserUpdate', user);
}

export async function onGuildMemberAdd(member: GuildMember) {
  console.info('onGuildMemberAdd', member);
}

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember
) {
  console.info('onGuildMemberRemove', member);
}

export async function onGuildMemberUpdate(
  member: GuildMember | PartialGuildMember
) {
  console.info('onGuildMemberUpdate', member);
}
