import { SerializedChannel, SerializedThread } from '@linen/types';
import { scrollToBottom } from '@linen/utilities/scroll';
import { SerializedUser } from '@linen/types';
import { SerializedAccount } from '@linen/types';
import debounce from '@linen/utilities/debounce';
import { StartSignUpFn } from 'contexts/Join';
import { createThreadImitation } from './utilities/thread';
import { UploadedFile } from '@linen/types';
import * as api from 'utilities/requests';

const debouncedSendChannelMessage = debounce(
  ({
    message,
    files,
    communityId,
    channelId,
    imitationId,
  }: {
    message: string;
    files: UploadedFile[];
    communityId: string;
    channelId: string;
    imitationId: string;
  }) =>
    api.createThread({
      accountId: communityId,
      body: message,
      files,
      channelId,
      imitationId,
    }),
  100
);

export function sendMessageWrapper({
  currentUser,
  allUsers,
  currentChannel,
  setUploads,
  setThreads,
  scrollableRootRef,
  currentCommunity,
  startSignUp,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  currentChannel: SerializedChannel;
  setUploads: any;
  setThreads: any;
  scrollableRootRef: any;
  currentCommunity: SerializedAccount;
  startSignUp?: StartSignUpFn;
}) {
  return async ({
    message,
    files,
    channelId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
  }) => {
    if (!currentUser) {
      startSignUp?.({
        communityId: currentCommunity.id,
        onSignIn: {
          run: sendMessageWrapper,
          init: {
            allUsers,
            currentChannel,
            setThreads,
            scrollableRootRef,
            currentCommunity,
          },
          params: {
            message,
            channelId,
          },
        },
      });
      return;
    }
    const imitation: SerializedThread = createThreadImitation({
      message,
      mentions: allUsers,
      files,
      author: currentUser,
      channel: currentChannel,
    });
    setUploads([]);
    setThreads((threads: SerializedThread[]) => {
      return [...threads, imitation];
    });
    setTimeout(
      () => scrollToBottom(scrollableRootRef.current as HTMLElement),
      0
    );
    return debouncedSendChannelMessage({
      message,
      files,
      communityId: currentCommunity.id,
      channelId,
      imitationId: imitation.id,
    })
      .then((response: any) => {
        if (response) {
          return response;
        }
        throw 'Could not send a message';
      })
      .then(
        ({
          thread,
          imitationId,
        }: {
          thread: SerializedThread;
          imitationId: string;
        }) => {
          setThreads((threads: SerializedThread[]) => {
            const threadId = thread.id;
            let index;
            index = threads.findIndex((thread) => thread.id === threadId);
            if (index >= 0) {
              return threads;
            }
            return [
              ...threads.filter((thread) => thread.id !== imitationId),
              thread,
            ];
          });
        }
      );
  };
}
