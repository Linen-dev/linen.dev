import { v4 as uuid } from 'uuid';
import { serializeMessage } from './message';
import { serializeChannel } from './channel';
import {
  SerializedMessage,
  SerializedThread,
  MessageForSerialization,
  MessageFormat,
  SerializedChannel,
  SerializedUser,
  ThreadState,
  UploadedFile,
  SerializedTopic,
} from '@linen/types';
import { username } from './user';

function serializeMessages(
  messages?: MessageForSerialization[]
): SerializedMessage[] {
  if (!messages) {
    return [];
  }
  return messages.map(serializeMessage);
}

export function serializeThread({
  closeAt,
  firstManagerReplyAt,
  firstUserReplyAt,
  createdAt,
  updatedAt,
  ...thread
}: any): SerializedThread {
  return {
    ...thread,
    sentAt: thread.sentAt.toString(),
    lastReplyAt: thread.lastReplyAt?.toString() || thread.sentAt.toString(),
    channel: thread.channel ? serializeChannel(thread.channel) : null,
    messages: serializeMessages(thread.messages),
  };
}

export function createThreadImitation({
  message,
  title,
  author,
  files,
  mentions,
  channel,
}: {
  message: string;
  title?: string;
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
          role: author.role,
        },
      },
    ],
    messageCount: 1,
    channel: {
      id: '1',
      channelName: channel.channelName,
      hidden: channel.hidden,
      default: channel.default,
      landing: channel.landing,
      readonly: channel.readonly,
      accountId: null,
      pages: null,
      displayOrder: 0,
      viewType: channel.viewType,
    },
    channelId: channel.id,
    hidden: false,
    viewCount: 0,
    incrementId: -1,
    externalThreadId: null,
    slug: null,
    title,
    state: ThreadState.OPEN,
    pinned: false,
    resolutionId: null,
    page: null,
  };
}

export function serializeTopic(topic: {
  id: string;
  threadId: string | null;
  sentAt: Date;
  usersId: string | null;
}): SerializedTopic {
  return {
    messageId: topic.id,
    threadId: topic.threadId!,
    sentAt: new Date(topic.sentAt).toISOString(),
    usersId: topic.usersId,
  };
}
