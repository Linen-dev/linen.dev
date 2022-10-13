import { useEffect, useState, useRef } from 'react';
import { Thread } from 'components/Thread';
import { scrollToBottom } from 'utilities/scroll';
import { ThreadState } from '@prisma/client';
import useThreadWebsockets from 'hooks/websockets/thread';
import { SerializedMessage } from 'serializers/message';
import { useUsersContext } from 'contexts/Users';
import { useJoinContext } from 'contexts/Join';
import { sendMessageWrapper } from './sendMessageWrapper';
import { toast } from 'components/Toast';

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
  const { startSignUp } = useJoinContext();

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    threadId && fetch(`/api/count?incrementId=${threadId}`, { method: 'PUT' });
  }, [threadId]);

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
        toast.error(exception.message);
      });
  };

  const sendMessage = sendMessageWrapper({
    currentUser,
    startSignUp,
    currentCommunity,
    allUsers,
    setMessages,
  });

  return (
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
  );
}
