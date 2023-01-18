import { v4 as uuid } from 'uuid';
import { StartSignUpFn } from 'contexts/Join';
import { username } from 'serializers/user';
import {
  MessageFormat,
  SerializedMessage,
  UploadedFile,
  SerializedThread,
  SerializedUser,
} from '@linen/types';
import debounce from '@linen/utilities/debounce';

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

export function sendMessageWrapper({
  currentUser,
  startSignUp,
  currentCommunity,
  allUsers,
  setThread,
}: {
  currentUser: any;
  startSignUp?: StartSignUpFn;
  currentCommunity: any;
  allUsers: SerializedUser[];
  setThread: Function;
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

    return debouncedSendMessage({
      message,
      files,
      communityId: currentCommunity.id,
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
          setThread((thread: SerializedThread) => {
            const messageId = message.id;
            const index = thread.messages.findIndex((t) => t.id === messageId);
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
          });
        }
      );
  };
}
