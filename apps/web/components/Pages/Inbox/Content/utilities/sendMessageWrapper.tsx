import React from 'react';
import {
  MessageFormat,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  UploadedFile,
} from '@linen/types';
import { username } from 'serializers/user';
import { InboxResponse } from '../../types';
import { v4 as uuid } from 'uuid';
import debounce from '@linen/utilities/debounce';
import * as api from 'utilities/requests';

const debouncedSendMessage = debounce(
  ({
    message,
    files,
    communityId,
    channelId,
    threadId,
    imitationId,
  }: {
    message: string;
    files: UploadedFile[];
    communityId: string;
    channelId: string;
    threadId: string;
    imitationId: string;
  }) => {
    return api.createMessage({
      body: message,
      files,
      accountId: communityId,
      channelId,
      threadId,
      imitationId,
    });
  },
  100
);

export function sendMessageWrapper({
  currentUser,
  allUsers,
  setThread,
  setInbox,
  communityId,
}: {
  currentUser: SerializedUser;
  allUsers: SerializedUser[];
  setThread: React.Dispatch<React.SetStateAction<SerializedThread | undefined>>;
  setInbox: React.Dispatch<React.SetStateAction<InboxResponse>>;
  communityId: string;
}) {
  return async ({
    message,
    files,
    channelId,
    threadId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    threadId: string;
  }) => {
    const imitation: SerializedMessage = {
      id: uuid(),
      body: message,
      sentAt: new Date().toISOString(),
      usersId: currentUser.id,
      mentions: allUsers,
      attachments: files.map((file) => {
        return { name: file.id, url: file.url };
      }),
      reactions: [],
      threadId,
      messageFormat: MessageFormat.LINEN,
      author: {
        id: currentUser.id,
        externalUserId: currentUser.externalUserId,
        username: username(currentUser.displayName),
        displayName: currentUser.displayName,
        profileImageUrl: currentUser.profileImageUrl,
        authsId: null,
      },
    };

    setThread((thread) => {
      if (!thread) {
        return;
      }
      if (threadId === thread.id) {
        return {
          ...thread,
          messages: [...thread.messages, imitation],
        };
      }
      return thread;
    });

    setInbox((inbox) => {
      return {
        ...inbox,
        threads: inbox.threads.map((thread) => {
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: [...thread.messages, imitation],
            };
          }
          return thread;
        }),
      };
    });

    return debouncedSendMessage({
      message,
      files,
      communityId,
      channelId,
      threadId,
      imitationId: imitation.id,
    }).then(
      ({
        message,
        imitationId,
      }: {
        message: SerializedMessage;
        imitationId: string;
      }) => {
        setThread((thread: any) => {
          if (!thread) {
            return;
          }
          const messageId = message.id;
          const index = thread.messages.findIndex(
            (message: SerializedMessage) => message.id === messageId
          );
          if (index >= 0) {
            return thread;
          }
          return {
            ...thread,
            messages: [
              ...thread.messages.filter(
                (message: SerializedMessage) => message.id !== imitationId
              ),
              message,
            ],
          };
        });

        setInbox((inbox) => {
          return {
            ...inbox,
            threads: inbox.threads.map((thread) => {
              if (thread.id === threadId) {
                const messageId = message.id;
                const index = thread.messages.findIndex(
                  (message: SerializedMessage) => message.id === messageId
                );
                if (index >= 0) {
                  return thread;
                }
                return {
                  ...thread,
                  messages: [
                    ...thread.messages.filter(
                      (message: SerializedMessage) => message.id !== imitationId
                    ),
                    message,
                  ],
                };
              }
              return thread;
            }),
          };
        });
      }
    );
  };
}
