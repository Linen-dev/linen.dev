import { SerializedThread } from 'serializers/thread';
import { ThreadState, Roles, MessageFormat } from '@prisma/client';
import { scrollToBottom } from 'utilities/scroll';
import { v4 as uuid } from 'uuid';
import { SerializedUser } from 'serializers/user';
import { SerializedAccount } from 'serializers/account';
import debounce from 'utilities/debounce';
import { StartSignUpFn } from 'contexts/Join';

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
    const imitation: SerializedThread = {
      id: uuid(),
      sentAt: new Date().getTime().toString(),
      lastReplyAt: new Date().getTime().toString(),
      messages: [
        {
          id: 'imitation-message-id',
          body: message,
          sentAt: new Date().getTime().toString(),
          usersId: 'imitation-user-id',
          mentions: allUsers,
          attachments: [],
          reactions: [],
          threadId: 'imitation-thread-id',
          messageFormat: MessageFormat.LINEN,
          author: {
            id: currentUser.id,
            displayName: currentUser.displayName,
            profileImageUrl: currentUser.profileImageUrl,
            externalUserId: currentUser.externalUserId,
            isBot: false,
            isAdmin: false,
            anonymousAlias: null,
            accountsId: 'imitation-account-id',
            authsId: null,
            role: Roles.MEMBER,
          },
        },
      ],
      messageCount: 1,
      channel: {
        channelName: currentChannel.channelName,
        hidden: currentChannel.hidden,
        default: currentChannel.default,
      },
      channelId: currentChannel.id,
      hidden: false,
      viewCount: 0,
      incrementId: -1,
      externalThreadId: null,
      slug: null,
      title: null,
      state: ThreadState.OPEN,
      pinned: false,
    };
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
