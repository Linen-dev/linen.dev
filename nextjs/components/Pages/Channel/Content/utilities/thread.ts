import { v4 as uuid } from 'uuid';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { MessageFormat, Roles, ThreadState } from '@prisma/client';
import { ChannelSerialized } from 'lib/channel';

export function createThreadImitation({
  message,
  author,
  mentions,
  channel,
}: {
  message: string;
  author: SerializedUser;
  mentions: SerializedUser[];
  channel: ChannelSerialized;
}): SerializedThread {
  return {
    id: uuid(),
    sentAt: new Date().toISOString(),
    lastReplyAt: new Date().toISOString(),
    messages: [
      {
        id: 'imitation-message-id',
        body: message,
        sentAt: new Date().toISOString(),
        usersId: 'imitation-user-id',
        mentions,
        attachments: [],
        reactions: [],
        threadId: 'imitation-thread-id',
        messageFormat: MessageFormat.LINEN,
        author: {
          id: author.id,
          displayName: author.displayName,
          profileImageUrl: author.profileImageUrl,
          externalUserId: author.externalUserId,
          isBot: false,
          isAdmin: false,
          anonymousAlias: null,
          accountsId: 'imitation-account-id',
          authsId: null,
          role: Roles.MEMBER,
        },
      },
    ],
    messageCount: 1,
    channel: {
      channelName: channel.channelName,
      hidden: channel.hidden,
      default: channel.default,
    },
    channelId: channel.id,
    hidden: false,
    viewCount: 0,
    incrementId: -1,
    externalThreadId: null,
    slug: null,
    title: null,
    state: ThreadState.OPEN,
    pinned: false,
  };
}
