import React from 'react';
import {
  SerializedThread,
  SerializedUser,
  SerializedAccount,
  UploadedFile,
  SerializedMessage,
} from '@linen/types';
import debounce from '@linen/utilities/debounce';
import { createMessageImitation } from './utilities/message';
import type { ApiClient } from '@linen/api-client';

export function sendThreadMessageWrapper({
  currentUser,
  allUsers,
  setUploads,
  setThreads,
  currentThreadId,
  currentCommunity,
  startSignUp,
  api,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  setUploads: any;
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  currentThreadId: string | undefined;
  currentCommunity: SerializedAccount;
  startSignUp?: (...args: any) => void;
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
      startSignUp?.({
        communityId: currentCommunity.id,
        onSignIn: {
          run: sendThreadMessageWrapper,
          init: {
            allUsers,
            setThreads,
            currentThreadId,
            currentCommunity,
          },
          params: {
            message,
            channelId,
            threadId,
          },
        },
      });
      return;
    }
    const imitation = createMessageImitation({
      message,
      threadId,
      files,
      author: currentUser,
      mentions: allUsers,
    });
    setUploads([]);
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === currentThreadId) {
          return {
            ...thread,
            messages: [...thread.messages, imitation],
          };
        }
        return thread;
      });
    });

    return debounce(
      api.createMessage,
      100
    )({
      body: message,
      accountId: currentCommunity.id,
      files,
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
        setThreads((threads) => {
          return threads.map((thread) => {
            if (thread.id === currentThreadId) {
              const messageId = message.id;
              const index = thread.messages.findIndex(
                (message) => message.id === messageId
              );
              if (index >= 0) {
                return thread;
              }
              return {
                ...thread,
                messages: [
                  ...thread.messages.filter(
                    (message) => message.id !== imitationId
                  ),
                  message,
                ],
              };
            }
            return thread;
          });
        });
      }
    );
  };
}
