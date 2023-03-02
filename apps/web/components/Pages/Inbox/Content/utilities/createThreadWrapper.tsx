import React from 'react';
import {
  MessageFormat,
  SerializedChannel,
  SerializedThread,
  SerializedUser,
  ThreadState,
  UploadedFile,
} from '@linen/types';
import { username } from 'serializers/user';
import { InboxResponse } from '../../types';
import { v4 as uuid } from 'uuid';
import debounce from '@linen/utilities/debounce';
import * as api from 'utilities/requests';

const debouncedCreateThread = debounce(
  ({
    message,
    title,
    files,
    communityId,
    channelId,
    imitationId,
  }: {
    message: string;
    title?: string;
    files: UploadedFile[];
    communityId: string;
    channelId: string;
    imitationId: string;
  }) => {
    return api.createThread({
      body: message,
      title,
      files,
      accountId: communityId,
      channelId,
      imitationId,
    });
  },
  100
);

export function createThreadWrapper({
  currentUser,
  allUsers,
  setThread,
  communityId,
  page,
  limit,
}: {
  currentUser: SerializedUser;
  allUsers: SerializedUser[];
  setThread: React.Dispatch<React.SetStateAction<SerializedThread | undefined>>;
  communityId: string;
  page: number;
  limit: number;
}) {
  return async ({
    message,
    title,
    files,
    channel,
  }: {
    message: string;
    title?: string;
    files: UploadedFile[];
    channel: SerializedChannel;
  }) => {
    const id = `imitation-${uuid()}`;
    const imitation: SerializedThread = {
      id,
      sentAt: new Date().toISOString(),
      lastReplyAt: new Date().toISOString(),
      messages: [
        {
          id: uuid(),
          body: message,
          sentAt: new Date().toISOString(),
          usersId: currentUser.id,
          mentions: allUsers,
          attachments: files.map((file) => {
            return { name: file.id, url: file.url };
          }),
          reactions: [],
          threadId: id,
          messageFormat: MessageFormat.LINEN,
          author: {
            id: currentUser.id,
            externalUserId: currentUser.externalUserId,
            username: username(currentUser.displayName),
            displayName: currentUser.displayName,
            profileImageUrl: currentUser.profileImageUrl,
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
      incrementId: 0,
      externalThreadId: null,
      slug: null,
      title,
      state: ThreadState.OPEN,
      pinned: false,
      resolutionId: null,
    };

    setThread((thread) => {
      if (page === 1) {
        return imitation;
      }
      return thread;
    });

    return debouncedCreateThread({
      message,
      title,
      files,
      communityId,
      channelId: channel.id,
      imitationId: imitation.id,
    }).then(
      ({
        thread,
        imitationId,
      }: {
        thread: SerializedThread;
        imitationId: string;
      }) => {
        setThread((current: any) => {
          if (current.id === imitationId) {
            return thread;
          }

          return current;
        });
      }
    );
  };
}
