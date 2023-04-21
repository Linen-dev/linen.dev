import React from 'react';
import {
  MessageFormat,
  SerializedChannel,
  SerializedThread,
  SerializedUser,
  ThreadState,
  UploadedFile,
} from '@linen/types';
import { username } from '@linen/serializers/user';
import { v4 as uuid } from 'uuid';
import debounce from '@linen/utilities/debounce';
import * as api from 'utilities/requests';
import Toast from '@linen/ui/Toast';
import MessageSentToast from '../MessageSentToast';

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
}: {
  currentUser: SerializedUser;
  allUsers: SerializedUser[];
  setThread: React.Dispatch<React.SetStateAction<SerializedThread | undefined>>;
  communityId: string;
  page: number;
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
      page: null,
    };

    function onUndo() {
      setThread((thread) => {
        if (thread?.id === imitation.id) {
          return undefined;
        }
        return thread;
      });
    }

    function onContinue() {
      debouncedCreateThread({
        message,
        title,
        files,
        communityId,
        channelId: channel.id,
        imitationId: imitation.id,
      });
    }

    const TIMEOUT = 2000;

    Toast.success(
      <MessageSentToast
        onUndo={onUndo}
        onContinue={onContinue}
        timeout={TIMEOUT}
      />,
      { duration: TIMEOUT * 2 }
    );

    return new Promise((resolve) => setTimeout(resolve, TIMEOUT));
  };
}
