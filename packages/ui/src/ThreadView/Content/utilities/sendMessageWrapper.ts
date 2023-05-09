import { v4 as uuid } from 'uuid';
import { username } from '@linen/serializers/user';
import {
  MessageFormat,
  SerializedMessage,
  UploadedFile,
  SerializedThread,
  SerializedUser,
} from '@linen/types';
import debounce from '@linen/utilities/debounce';
import type { ApiClient } from '@linen/api-client';

export function sendMessageWrapper({
  currentUser,
  startSignUp,
  currentCommunity,
  allUsers,
  setThread,
  api,
}: {
  currentUser: any;
  startSignUp?(...args: any): any;
  currentCommunity: any;
  allUsers: SerializedUser[];
  setThread: Function;
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
          run: sendMessageWrapper,
          init: {
            currentCommunity,
            allUsers,
            setThread,
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

    setThread((thread: SerializedThread) => {
      return {
        ...thread,
        messages: [...thread.messages, imitation],
      };
    });

    return debounce(
      api.createMessage,
      100
    )({
      body: message,
      files,
      accountId: currentCommunity.id,
      channelId,
      threadId,
      imitationId: imitation.id,
    }).then(({ message, imitationId }) => {
      setThread((thread: SerializedThread) => {
        const messageId = message.id;
        const index = thread.messages.findIndex((t) => t.id === messageId);
        if (index >= 0) {
          return thread;
        }
        return {
          ...thread,
          messages: [
            ...thread.messages.filter((message) => message.id !== imitationId),
            message,
          ],
        };
      });
    });
  };
}
