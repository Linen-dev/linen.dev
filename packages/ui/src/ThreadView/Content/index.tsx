import React, { useState } from 'react';
import Thread from '@/Thread';
import { useUsersContext } from '@linen/contexts/Users';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import Toast from '@/Toast';
import {
  ThreadState,
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedMessage,
  SerializedThread,
  Settings,
} from '@linen/types';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threadUrl: string | null;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  useJoinContext(): any;
  apiUpdateThread(...args: any): Promise<any>;
  apiFetchMentions(...args: any): Promise<any>;
  apiPut(...args: any): Promise<any>;
  apiUpload(...args: any): Promise<any>;
  JoinChannelLink(...args: any): JSX.Element;
  Actions(...args: any): JSX.Element;
  apiCreateMessage(...args: any): Promise<any>;
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
  useJoinContext,
  apiUpdateThread,
  apiFetchMentions,
  apiPut,
  apiUpload,
  JoinChannelLink,
  Actions,
  apiCreateMessage,
}: Props) {
  const [thread, setThread] = useState(initialThread);
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();

  const token = permissions.token || null;
  const currentUser = permissions.user;

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
    return apiUpdateThread({
      accountId: settings.communityId,
      id: thread.id,
      ...options,
    }).catch((_) => {
      Toast.error('Failed to close the thread.');
    });
  };

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    startSignUp,
    currentCommunity,
    allUsers,
    setThread,
    apiCreateMessage,
  });

  return (
    <div className={styles.wrapper}>
      <Thread
        {...{
          Actions,
          fetchMentions: apiFetchMentions,
          JoinChannelLink,
          put: apiPut,
          upload: apiUpload,
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
