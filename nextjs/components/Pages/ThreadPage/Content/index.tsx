import { useEffect, useState, useRef } from 'react';
import { Thread } from 'components/Thread';
import { scrollToBottom } from 'utilities/scroll';
import { NotifyMentions } from 'components/Notification';
import { ThreadState } from '@prisma/client';
import useThreadWebsockets from 'hooks/websockets/thread';
import { SerializedMessage } from 'serializers/message';
import debounce from 'utilities/debounce';
import { useUsersContext } from 'contexts/Users';
import { MessageFormat, Roles } from '@prisma/client';
import { v4 as uuid } from 'uuid';

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

export default function Content({
  id,
  threadId,
  currentChannel,
  currentCommunity,
  currentUser,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  slug,
  incrementId,
  messages: initialMessages,
  title: initialTitle,
  state: initialState,
  permissions,
  token,
}: any) {
  const [state, setState] = useState(initialState);
  const [title, setTitle] = useState(initialTitle);
  const [messages, setMessages] = useState(initialMessages);
  const [allUsers] = useUsersContext();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    threadId && fetch(`/api/count?incrementId=${threadId}`, { method: 'PUT' });
  }, []);

  useThreadWebsockets({
    id,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
      setMessages((messages: SerializedMessage[]) => [
        ...messages.filter(
          ({ id }: any) => id !== imitationId && id !== messageId
        ),
        message,
      ]);
    },
  });

  if (!threadId) {
    return <div></div>;
  }

  const updateThread = ({
    state: newState,
    title: newTitle,
  }: {
    state?: ThreadState;
    title?: string;
  }) => {
    const options = {
      state: newState || state,
      title: newTitle || title,
    };
    setState(options.state);
    setTitle(options.title);
    return fetch(`/api/threads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(options),
    })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new Error('Failed to close the thread.');
      })
      .catch((exception) => {
        alert(exception.message);
      });
  };

  const sendMessage = async ({
    message,
    channelId,
    threadId,
  }: {
    message: string;
    channelId: string;
    threadId: string;
  }) => {
    if (!currentUser) {
      throw 'current user is required';
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

    setMessages((messages: SerializedMessage[]) => {
      return [...messages, imitation];
    });

    return debouncedSendMessage({
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
          setMessages((messages: SerializedMessage[]) => {
            const messageId = message.id;
            const index = messages.findIndex((t) => t.id === messageId);
            if (index >= 0) {
              return messages;
            }
            return [
              ...messages.filter((message) => message.id !== imitationId),
              message,
            ];
          });
        }
      );
  };

  return (
    <>
      <NotifyMentions token={token} key="notifyMentions" />
      <div className="w-full">
        <Thread
          key={id}
          id={id}
          channelId={currentChannel.id}
          channelName={currentChannel.channelName}
          title={title}
          state={state}
          messages={messages}
          threadUrl={threadUrl}
          viewCount={viewCount}
          settings={settings}
          incrementId={incrementId}
          isSubDomainRouting={isSubDomainRouting}
          slug={slug}
          permissions={permissions}
          updateThread={updateThread}
          sendMessage={sendMessage}
          onSend={() => {
            scrollToBottom(ref.current as HTMLElement);
          }}
          onMount={() => {
            permissions.chat && scrollToBottom(ref.current as HTMLElement);
          }}
        />
      </div>
    </>
  );
}
