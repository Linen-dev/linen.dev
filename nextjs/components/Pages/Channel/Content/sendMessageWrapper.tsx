import { SerializedThread } from 'serializers/thread';
import { scrollToBottom } from 'utilities/scroll';
import { SerializedUser } from 'serializers/user';
import { SerializedAccount } from 'serializers/account';
import debounce from 'utilities/debounce';
import { StartSignUpFn } from 'contexts/Join';
import { createThreadImitation } from './utilities/thread';

const debouncedSendChannelMessage = debounce(
  ({ message, communityId, channelId, imitationId }: any) => {
    return fetch(`/api/messages/channel`, {
      method: 'POST',
      body: JSON.stringify({
        communityId,
        body: message,
        channelId,
        imitationId,
      }),
    });
  },
  100
);

export function sendMessageWrapper({
  currentUser,
  allUsers,
  currentChannel,
  setThreads,
  scrollableRootRef,
  currentCommunity,
  startSignUp,
}: {
  currentUser: SerializedUser | null;
  allUsers: SerializedUser[];
  currentChannel: {
    id: string;
    channelName: string;
    accountId: string | null;
    hidden: boolean;
    default: boolean;
  };
  setThreads: any;
  scrollableRootRef: any;
  currentCommunity: SerializedAccount | null;
  startSignUp?: StartSignUpFn;
}) {
  return async ({
    message,
    channelId,
  }: {
    message: string;
    channelId: string;
  }) => {
    if (!currentUser) {
      startSignUp?.({
        communityId: currentCommunity?.id!,
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
      author: currentUser,
      channel: currentChannel,
    });

    setThreads((threads: SerializedThread[]) => {
      return [...threads, imitation];
    });
    setTimeout(
      () => scrollToBottom(scrollableRootRef.current as HTMLElement),
      0
    );
    return debouncedSendChannelMessage({
      message,
      communityId: currentCommunity?.id,
      channelId,
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
