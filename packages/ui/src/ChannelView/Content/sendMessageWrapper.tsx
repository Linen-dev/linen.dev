import {
  SerializedChannel,
  SerializedThread,
  SerializedUser,
  SerializedAccount,
  UploadedFile,
} from '@linen/types';
import { scrollToBottom } from '@linen/utilities/scroll';
import debounce from '@linen/utilities/debounce';
import { createThreadImitation } from '@linen/serializers/thread';
import type { ApiClient } from '@linen/api-client';

export function sendMessageWrapper({
  currentUser,
  allUsers,
  currentChannel,
  setUploads,
  setThreads,
  scrollableRootRef,
  currentCommunity,
  startSignUp,
  api,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  currentChannel: SerializedChannel;
  setUploads: any;
  setThreads: any;
  scrollableRootRef: any;
  currentCommunity: SerializedAccount;
  startSignUp?: (...args: any) => void;
  api: ApiClient;
}) {
  return async ({
    message,
    title,
    files,
    channelId,
  }: {
    message: string;
    title?: string;
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
    const imitation = createThreadImitation({
      message,
      title,
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
    return debounce(
      api.createThread,
      100
    )({
      body: message,
      title,
      files,
      accountId: currentCommunity.id,
      channelId,
      imitationId: imitation.id,
    })
    .then(({ thread, imitationId }) => {
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
    });
  };
}
