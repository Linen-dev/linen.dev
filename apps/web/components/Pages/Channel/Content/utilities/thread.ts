import { v4 as uuid } from 'uuid';
import { username } from '@linen/serializers/user';
import {
  MessageFormat,
  SerializedChannel,
  SerializedThread,
  SerializedUser,
  ThreadState,
  UploadedFile,
} from '@linen/types';

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
  channel: SerializedChannel;
}): SerializedThread {
  const id = uuid();
  return {
    id,
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
        threadId: id,
        externalId: null,
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
      id: '1',
      channelName: channel.channelName,
      hidden: channel.hidden,
      default: channel.default,
      accountId: null,
      pages: null,
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
    resolutionId: null,
    page: null,
  };
}
