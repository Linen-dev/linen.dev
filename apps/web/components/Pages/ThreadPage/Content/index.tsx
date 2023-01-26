import { useState, useRef } from 'react';
import Thread from 'components/Thread';
import { ThreadState } from '@linen/types';
import { useUsersContext } from '@linen/contexts/Users';
import { useJoinContext } from 'contexts/Join';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import { Toast } from '@linen/ui';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedMessage,
  SerializedThread,
  Settings,
} from '@linen/types';

interface Props {
  thread: SerializedThread;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threadUrl: string | null;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
}

export default function Content({
  thread: initialThread,
  currentChannel,
  currentCommunity,
  threadUrl,
  isBot,
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

  const onThreadMessage = (
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ) => {
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
  };

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
        Toast.error(exception.message);
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
        isBot={isBot}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        updateThread={updateThread}
        sendMessage={sendMessage}
        token={token}
        onMessage={(message, messageId, imitationId) => {
          onThreadMessage(message, messageId, imitationId);
        }}
      />
    </div>
  );
}
