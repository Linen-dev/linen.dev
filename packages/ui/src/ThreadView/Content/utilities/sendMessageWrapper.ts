import { v4 as uuid } from 'uuid';
import { username } from '@linen/serializers/user';
import {
  MessageFormat,
  SerializedMessage,
  UploadedFile,
  SerializedThread,
  SerializedUser,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';

export function sendMessageWrapper({
  currentUser,
  startSignUp,
  currentCommunity,
  allUsers,
  setThread,
  createMessage,
}: {
  currentUser: any;
  startSignUp?(...args: any): any;
  currentCommunity: any;
  allUsers: SerializedUser[];
  setThread: Function;
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
      localStorage.set('signup.message', {
        body: message,
        channelId,
        threadId,
      });
      startSignUp?.({
        communityId: currentCommunity.id,
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

    return createMessage({
      body: message,
      files,
      accountId: currentCommunity.id,
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
