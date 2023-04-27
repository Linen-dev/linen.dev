import { useState, useRef } from 'react';
import Thread from '@linen/ui/Thread';
import { ThreadState } from '@linen/types';
import { useUsersContext } from '@linen/contexts/Users';
import { useJoinContext } from 'contexts/Join';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import Toast from '@linen/ui/Toast';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedMessage,
  SerializedThread,
  Settings,
} from '@linen/types';
import * as api from 'utilities/requests';
import Actions from 'components/Actions';
import JoinChannelLink from 'components/Link/JoinChannelLink';

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
    threadId: string,
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ) => {
    setThread((thread) => {
      if (thread.id === threadId) {
        return {
          ...thread,
          messages: [
            ...thread.messages.filter(
              ({ id }: any) => id !== imitationId && id !== messageId
            ),
            message,
          ],
        };
      }
      return thread;
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
      title: newTitle || thread.title || undefined,
    };
    setThread((thread) => {
      return {
        ...thread,
        ...options,
      };
    });
    return api
      .updateThread({
        accountId: settings.communityId,
        id: thread.id,
        ...options,
      })
      .catch((_) => {
        Toast.error('Failed to close the thread.');
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
        {...{
          Actions,
          fetchMentions: api.fetchMentions,
          JoinChannelLink,
          put: api.put,
          upload: api.upload,
        }}
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
        onMessage={(threadId, message, messageId, imitationId) => {
          onThreadMessage(threadId, message, messageId, imitationId);
        }}
        expanded
      />
    </div>
  );
}
