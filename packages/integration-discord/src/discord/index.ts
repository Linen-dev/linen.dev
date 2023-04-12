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
import { logger } from '@linen/logger';

export { onMessageCreate } from './onMessageCreate';
export { onMessageDelete } from './onMessageDelete';

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
