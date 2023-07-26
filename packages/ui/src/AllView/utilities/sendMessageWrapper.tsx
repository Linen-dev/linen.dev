import React from 'react';
import {
  AllResponse,
  MessageFormat,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  UploadedFile,
} from '@linen/types';
import { username } from '@linen/serializers/user';
import { v4 as uuid } from 'uuid';

export function sendMessageWrapper({
  currentUser,
  allUsers,
  setThread,
  setData,
  communityId,
  createMessage,
}: {
  currentUser: SerializedUser;
  allUsers: SerializedUser[];
  setThread: React.Dispatch<React.SetStateAction<SerializedThread | undefined>>;
  setData: React.Dispatch<React.SetStateAction<AllResponse>>;
  communityId: string;
  createMessage: any;
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
      externalId: null,
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

    setData((data) => {
      return {
        ...data,
        threads: data.threads.map((thread) => {
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

    return createMessage({
      body: message,
      files,
      accountId: communityId,
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

        setData((data) => {
          return {
            ...data,
            threads: data.threads.map((thread) => {
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
