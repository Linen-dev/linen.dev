import React, { useState } from 'react';
import Thread from '@/Thread';
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
  SerializedUser,
} from '@linen/types';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';
import { CustomLinkHelper } from '@linen/utilities/custom-link';

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
  useUsersContext(): any;
  fetchMentions(term?: string | undefined): Promise<SerializedUser[]>;
  api: ApiClient;
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
  useUsersContext,
  api,
  fetchMentions,
}: Props) {
  const [thread, setThread] = useState<SerializedThread>(initialThread);
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
    setThread((thread: SerializedThread) => {
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
    setThread((thread: SerializedThread) => {
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

  const editMessage = ({ id, body }: { id: string; body: string }) => {
    setThread((thread: SerializedThread) => {
      return {
        ...thread,
        messages: thread.messages.map((message: SerializedMessage) => {
          if (message.id === id) {
            return {
              ...message,
              body,
            };
          }
          return message;
        }),
      };
    });
    return api
      .updateMessage({
        accountId: settings.communityId,
        id,
        body,
      })
      .then(() => {
        Toast.success('Updated successfully.');
      })
      .catch((_) => {
        Toast.error('Failed to update the message.');
      });
  };

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    startSignUp,
    currentCommunity,
    allUsers,
    setThread,
    api,
  });

  return (
    <div className={styles.wrapper}>
      <Thread
        useUsersContext={useUsersContext}
        api={api}
        fetchMentions={fetchMentions}
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
        editMessage={editMessage}
        sendMessage={sendMessage}
        token={token}
        onMessage={(threadId, message, messageId, imitationId) => {
          onThreadMessage(threadId, message, messageId, imitationId);
        }}
        onClose={() => {
          if (thread.channel) {
            window.location.href = CustomLinkHelper({
              isSubDomainRouting,
              communityName: settings.communityName,
              communityType: settings.communityType,
              path: `/c/${thread.channel.channelName}${
                thread.page ? `/${thread.page}` : ''
              }#${thread.id}`,
            });
          }
        }}
        expanded
      />
    </div>
  );
}
