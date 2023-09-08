import React from 'react';
import {
  SerializedThread,
  SerializedUser,
  SerializedAccount,
  UploadedFile,
  SerializedMessage,
  StartSignUpProps,
  SerializedTopic,
} from '@linen/types';
import { createMessageImitation } from '@linen/serializers/message';
import { localStorage } from '@linen/utilities/storage';

export function createMessageWrapper({
  currentUser,
  allUsers,
  setUploads,
  setThreads,
  setTopics,
  currentThreadId,
  currentCommunity,
  startSignUp,
  createMessage,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  setUploads: any;
  setThreads: React.Dispatch<React.SetStateAction<SerializedThread[]>>;
  setTopics?: React.Dispatch<React.SetStateAction<SerializedTopic[]>>;
  currentThreadId: string | undefined;
  currentCommunity: SerializedAccount;
  startSignUp: (props: StartSignUpProps) => Promise<void>;
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
    if (!currentUser) {
      localStorage.set('nouser.message', {
        body: message,
        channelId,
        threadId,
      });
      startSignUp?.({
        communityId: currentCommunity.id,
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
            lastReplyAt: new Date(imitation.sentAt).getTime().toString(),
          };
        }
        return thread;
      });
    });
    if (setTopics) {
      setTopics((topics) => {
        return [
          ...topics,
          {
            messageId: imitation.id,
            threadId,
            sentAt: imitation.sentAt,
          },
        ];
      });
    }

    return createMessage({
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
        if (setTopics) {
          setTopics((topics) => {
            return topics.map((topic) => {
              if (topic.messageId === imitationId) {
                return {
                  messageId: message.id,
                  threadId: topic.threadId,
                  sentAt: topic.sentAt,
                };
              }
              return topic;
            });
          });
        }
      }
    );
  };
}
