import { LinenChannel, LinenMessage, LinenThread, LinenUser } from '../linen';
import { discordChannelType } from './constrains';
import type {
  Message,
  User,
  GuildMember,
  PublicThreadChannel,
  TextChannel,
} from 'discord.js';

export const parseUser = (
  author: User,
  member: GuildMember | null
): LinenUser => {
  return {
    externalUserId: author.id,
    displayName: member?.displayName || author.username,
    profileImageUrl: member?.avatarURL() || author.avatarURL(),
    isBot: member?.user.bot || author.bot,
  };
};

export const parseGuildUser = (member: GuildMember): LinenUser => {
  return {
    externalUserId: member.user.id,
    displayName: member.displayName,
    profileImageUrl: member.avatarURL(),
    isBot: member.user.bot,
  };
};

export const parseChannel = (channel: TextChannel): LinenChannel => {
  return {
    channelName: channel.name,
    externalChannelId: channel.id,
  };
};

export const parseChannelAndThread = async (message: Message) => {
  let thread, channel;
  // thread reply
  if (message.channel.type === discordChannelType.PUBLIC_THREAD) {
    const threadChannel = message.channel as PublicThreadChannel;
    thread = parseThreadFromChannel(threadChannel);

    if (threadChannel.parentId) {
      const fetchChannel = await message.client.channels.fetch(
        threadChannel.parentId
      );
      if (!fetchChannel) {
        throw new Error(`channel not found: ${threadChannel.parentId}`);
      }
      channel = parseChannel(fetchChannel as TextChannel);
    }
  }

  // single message on channel
  else if (message.channel.type === discordChannelType.GUILD_TEXT) {
    channel = parseChannel(message.channel as TextChannel);
  }
  return { thread, channel };
};

export const parseThreadFromChannel = (
  channel: PublicThreadChannel
): LinenThread => {
  return {
    externalThreadId: channel.id,
    sentAt: BigInt(channel.createdTimestamp || Date.now()),
    slug: channel.name,
    title: channel.name,
  };
};

export const parseThreadFromMessage = (message: Message): LinenThread => {
  return {
    externalThreadId: message.id,
    sentAt: BigInt(message.createdTimestamp),
    slug: message.content, // TODO: slugify
    title: message.content,
  };
};

export const parseMessage = (message: Message): LinenMessage => {
  return {
    body: message.content,
    externalMessageId: message.id,
    sentAt: new Date(message.createdAt), // TODO: validate this parse
  };
};
