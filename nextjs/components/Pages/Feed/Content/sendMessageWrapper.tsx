import React from 'react';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { FeedResponse } from '../types';
import { SerializedMessage } from 'serializers/message';
import { v4 as uuid } from 'uuid';
import { MessageFormat, Roles } from '@prisma/client';
import debounce from 'utilities/debounce';
import { StartSignUpFn } from 'contexts/Join';

const debouncedSendMessage = debounce(
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

export function sendMessageWrapper({
  currentUser,
  allUsers,
  setThread,
  setFeed,
  communityId,
  startSignUp,
}: {
  currentUser: SerializedUser;
  allUsers: SerializedUser[];
  setThread: React.Dispatch<React.SetStateAction<SerializedThread | undefined>>;
  setFeed: React.Dispatch<React.SetStateAction<FeedResponse>>;
  communityId: string;
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
        communityId,
        onSignIn: {
          run: sendMessageWrapper,
          init: {
            allUsers,
            setThread,
            setFeed,
            communityId,
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
      sentAt: new Date().toString(),
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

    setThread((thread) => {
      if (!thread) {
        return;
      }
      return {
        ...thread,
        messages: [...thread.messages, imitation],
      };
    });

    setFeed((feed) => {
      return {
        ...feed,
        threads: feed.threads.map((thread) => {
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
      communityId,
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

          setFeed((feed) => {
            return {
              ...feed,
              threads: feed.threads.map((thread) => {
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
                        (message: SerializedMessage) =>
                          message.id !== imitationId
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
