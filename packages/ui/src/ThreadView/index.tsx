import React from 'react';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedThread,
  SerializedUser,
  Settings,
} from '@linen/types';
import Content from './Content';
import styles from './index.module.scss';

interface Props {
  isBot?: boolean;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  thread: SerializedThread;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threadUrl: string | null;
  settings: Settings;
  useJoinContext(): any;
  apiUpdateThread(...args: any): Promise<any>;
  apiUpdateMessage(...args: any): Promise<any>;
  apiFetchMentions(term?: string): Promise<SerializedUser[]>;
  apiPut(...args: any): Promise<any>;
  apiUpload(...args: any): Promise<any>;
  JoinChannelLink(...args: any): JSX.Element;
  Actions(...args: any): JSX.Element;
  apiCreateMessage(...args: any): Promise<any>;
  useUsersContext(): any;
}

export default function ThreadView({
  thread,
  currentChannel,
  currentCommunity,
  threadUrl,
  isBot,
  isSubDomainRouting,
  settings,
  permissions,
  Actions,
  JoinChannelLink,
  apiFetchMentions,
  apiPut,
  apiUpdateThread,
  apiUpdateMessage,
  apiUpload,
  useJoinContext,
  apiCreateMessage,
  useUsersContext,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <Content
        thread={thread}
        currentChannel={currentChannel}
        currentCommunity={currentCommunity}
        threadUrl={threadUrl}
        isBot={isBot}
        isSubDomainRouting={isSubDomainRouting}
        settings={settings}
        permissions={permissions}
        {...{
          Actions,
          apiFetchMentions,
          apiPut,
          apiUpdateThread,
          apiUpdateMessage,
          apiUpload,
          useJoinContext,
          JoinChannelLink,
          apiCreateMessage,
          useUsersContext,
        }}
      />
    </div>
  );
}
