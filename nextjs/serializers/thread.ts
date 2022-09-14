import { MentionsWithUsers } from '../types/apiResponses/threads/[threadId]';
import { MessageWithAuthor } from '../types/partialTypes';
import { SerializedAttachment, SerializedReaction } from '../types/shared';
import type {
  channels,
  threads,
  users,
  messageAttachments,
  messageReactions,
} from '@prisma/client';

export interface SerializedMessage {
  id: string;
  body: string;
  sentAt: string;
  author?: users;
  usersId: string;
  mentions: MentionsWithUsers[];
  attachments: SerializedAttachment[];
  reactions: SerializedReaction[];
}

interface SerializedChannel {
  channelName: string;
  hidden: boolean;
  default: boolean;
}

export interface SerializedThread extends Omit<threads, 'sentAt'> {
  id: string;
  sentAt: string;
  messages: SerializedMessage[];
  channel: SerializedChannel | null;
}

type ThreadForSerialization = threads & {
  messages?: MessageWithAuthor[];
  channel?: channels;
};

function serializeChannel(channel?: channels): SerializedChannel | null {
  if (!channel) {
    return null;
  }
  return {
    channelName: channel.channelName,
    hidden: channel.hidden,
    default: channel.default,
  };
}

function serializeMessages(messages?: MessageWithAuthor[]) {
  if (!messages) {
    return [];
  }
  return messages.map((message: MessageWithAuthor) => {
    return {
      id: message.id,
      body: message.body,
      // Have to convert to string b/c Nextjs doesn't support date hydration -
      // see: https://github.com/vercel/next.js/discussions/11498
      sentAt: message.sentAt.toString(),
      author: message.author,
      usersId: message.usersId,
      mentions: message.mentions || [],
      attachments:
        message.attachments
          ?.map((attachment: messageAttachments) => {
            return {
              url: attachment.internalUrl,
              name: attachment.name,
            };
          })
          .filter(({ url }: SerializedAttachment) => Boolean(url)) || [],
      reactions:
        message.reactions
          ?.filter(
            (reaction: messageReactions) =>
              typeof reaction.count === 'number' && reaction.count > 0
          )
          ?.map((reaction: messageReactions) => {
            return {
              type: reaction.name,
              count: reaction.count,
            } as SerializedReaction;
          }) || [],
    };
  });
}

export default function serialize(
  thread: ThreadForSerialization
): SerializedThread {
  return {
    ...thread,
    sentAt: thread.sentAt.toString(),
    channel: serializeChannel(thread.channel),
    messages: serializeMessages(thread.messages),
  };
}
