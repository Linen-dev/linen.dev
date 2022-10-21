import { useState, useRef } from 'react';
import { Thread } from 'components/Thread';
import { scrollToBottom } from 'utilities/scroll';
import { ThreadState } from '@prisma/client';
import useThreadWebsockets from 'hooks/websockets/thread';
import { useUsersContext } from 'contexts/Users';
import { useJoinContext } from 'contexts/Join';
import { sendMessageWrapper } from './sendMessageWrapper';
import { toast } from 'components/Toast';
import { SerializedThread } from 'serializers/thread';
import { SerializedAccount } from 'serializers/account';
import type { Settings } from 'serializers/account/settings';
import type { ChannelSerialized } from 'lib/channel';
import { Permissions } from 'types/shared';

interface Props {
  thread: SerializedThread;
  currentChannel: ChannelSerialized;
  currentCommunity: SerializedAccount | null;
  threadUrl: string | null;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
}

export default function Content({
  thread: initialThread,
  currentChannel,
  currentCommunity,
  threadUrl,
  isSubDomainRouting,
  settings,
  permissions,
}: Props) {
  const [thread, setThread] = useState(initialThread);
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();

  const token = permissions.token || null;
  const currentUser = permissions.user;

  const ref = useRef<HTMLDivElement>(null);

  useThreadWebsockets({
    id: thread.id,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
      setThread((thread) => {
        return {
          ...thread,
          messages: [
            ...thread.messages.filter(
              ({ id }: any) => id !== imitationId && id !== messageId
            ),
            message,
          ],
        };
      });
    },
  });

  const updateThread = ({
    state: newState,
    title: newTitle,
  }: {
    state?: ThreadState;
    title?: string;
  }) => {
    const options = {
      state: newState || thread.state,
      title: newTitle || thread.title,
    };
    setThread((thread) => {
      return {
        ...thread,
        ...options,
      };
    });
    return fetch(`/api/threads/${thread.id}`, {
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
    currentUser: permissions.is_member ? currentUser : null,
    startSignUp,
    currentCommunity,
    allUsers,
    setThread, // setThread
  });

  return (
    <div className="w-full">
      <Thread
        thread={thread}
        key={thread.id}
        channelId={currentChannel.id}
        channelName={currentChannel.channelName}
        threadUrl={threadUrl}
        settings={settings}
        currentUser={currentUser}
        isSubDomainRouting={isSubDomainRouting}
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
