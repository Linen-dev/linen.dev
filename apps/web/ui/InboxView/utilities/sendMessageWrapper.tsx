import React from 'react';
import {
  MessageFormat,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  UploadedFile,
  InboxResponse,
} from '@linen/types';
import { username } from '@linen/serializers/user';
import { v4 as uuid } from 'uuid';
import debounce from '@linen/utilities/debounce';
import type { ApiClient } from '@linen/api-client';

const debouncedSendMessage = debounce(
  ({
    message,
    files,
    communityId,
    channelId,
    threadId,
    imitationId,
    api,
  }: {
    message: string;
    files: UploadedFile[];
    communityId: string;
    channelId: string;
    threadId: string;
    imitationId: string;
    api: ApiClient;
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
  api,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  setThread: React.Dispatch<React.SetStateAction<SerializedThread | undefined>>;
  setInbox: React.Dispatch<React.SetStateAction<InboxResponse>>;
  communityId: string;
  api: ApiClient;
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
    if (!currentUser) {
      return;
    }
    const id = `imitation-${uuid()}`;
    const imitation: SerializedMessage = {
      id,
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
      externalId: null,
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
      api,
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
          if (thread.id === threadId) {
            return {
              ...thread,
              messages: thread.messages.map((current: SerializedMessage) => {
                if (current.id === imitationId) {
                  return message;
                }
                return current;
              }),
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
                  messages: thread.messages.map(
                    (current: SerializedMessage) => {
                      if (current.id === imitationId) {
                        return message;
                      }
                      return current;
                    }
                  ),
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
