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
import type { ApiClient } from '@linen/api-client';

interface Props {
  isBot?: boolean;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  thread: SerializedThread;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  settings: Settings;
  useJoinContext(): any;
  useUsersContext: () => [SerializedUser[], any];
  api: ApiClient;
}

export default function ThreadView({
  thread,
  currentChannel,
  currentCommunity,
  isBot,
  isSubDomainRouting,
  settings,
  permissions,
  useJoinContext,
  useUsersContext,
  api,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <Content
        thread={thread}
        currentChannel={currentChannel}
        currentCommunity={currentCommunity}
        isBot={isBot}
        isSubDomainRouting={isSubDomainRouting}
        settings={settings}
        permissions={permissions}
        useJoinContext={useJoinContext}
        useUsersContext={useUsersContext}
        api={api}
        fetchMentions={(term?: string) => {
          if (!term) return Promise.resolve([]);
          return api.fetchMentions(term, currentCommunity.id);
        }}
      />
    </div>
  );
}
