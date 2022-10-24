import React from 'react';
import { SerializedThread } from 'serializers/thread';
import { Roles, MessageFormat } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { SerializedMessage } from 'serializers/message';
import { SerializedUser } from 'serializers/user';
import { SerializedAccount } from 'serializers/account';
import debounce from 'utilities/debounce';
import { StartSignUpFn } from 'contexts/Join';

const debouncedSendThreadMessage = debounce(
  ({ message, communityId, channelId, threadId, imitationId }: any) => {
    return fetch(`/api/messages/thread`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
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
    channelId,
    threadId,
  }: {
    message: string;
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
    const imitation: SerializedMessage = {
      id: uuid(),
      body: message,
      sentAt: new Date().getTime().toString(),
      usersId: currentUser.id,
      mentions: allUsers,
      attachments: [],
      reactions: [],
      threadId,
      messageFormat: MessageFormat.LINEN,
      author: {
        id: currentUser.id,
        externalUserId: currentUser.externalUserId,
        displayName: currentUser.displayName,
        profileImageUrl: currentUser.profileImageUrl,
        isBot: false,
        isAdmin: false,
        anonymousAlias: null,
        accountsId: 'fake-account-id',
        authsId: null,
        role: Roles.MEMBER,
      },
    };

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
