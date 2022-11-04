import { v4 as uuid } from 'uuid';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser, username } from 'serializers/user';
import { MessageFormat, ThreadState } from '@prisma/client';
import { ChannelSerialized } from 'lib/channel';
import { UploadedFile } from 'types/shared';

export function createThreadImitation({
  message,
  author,
  files,
  mentions,
  channel,
}: {
  message: string;
  author: SerializedUser;
  files: UploadedFile[];
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
        attachments: files.map((file) => {
          return {
            name: file.id,
            url: file.url,
          };
        }),
        reactions: [],
        threadId: 'imitation-thread-id',
        messageFormat: MessageFormat.LINEN,
        author: {
          id: author.id,
          username: username(author.displayName),
          displayName: author.displayName,
          profileImageUrl: author.profileImageUrl,
          externalUserId: author.externalUserId,
          authsId: null,
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
