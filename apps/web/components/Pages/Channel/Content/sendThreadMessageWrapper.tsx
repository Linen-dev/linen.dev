import React from 'react';
import { SerializedThread } from '@linen/types';
import { SerializedMessage } from '@linen/types';
import { SerializedUser } from '@linen/types';
import { SerializedAccount } from '@linen/types';
import debounce from 'utilities/debounce';
import { StartSignUpFn } from 'contexts/Join';
import { createMessageImitation } from './utilities/message';
import { UploadedFile } from '@linen/types';

const debouncedSendThreadMessage = debounce(
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
    return fetch(`/api/messages/thread`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        files,
        communityId,
        channelId,
        threadId,
        imitationId,
      }),
    });
  },
  100
);
export function sendThreadMessageWrapper({
  currentUser,
  allUsers,
  setThreads,
  currentThreadId,
  currentCommunity,
  startSignUp,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  currentThreadId: string | undefined;
  currentCommunity: SerializedAccount | null;
  startSignUp?: StartSignUpFn;
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
        communityId: currentCommunity?.id!,
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
    const imitation: SerializedMessage = createMessageImitation({
      message,
      threadId,
      files,
      author: currentUser,
      mentions: allUsers,
    });

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

    return debouncedSendThreadMessage({
      message,
      communityId: currentCommunity?.id,
      files,
      channelId,
      threadId,
      imitationId: imitation.id,
    })
      .then((response: any) => {
        if (response.ok) {
          return response.json();
        }
        throw 'Could not send a message';
      })
      .then(
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
            });
          });
        }
      );
  };
}
