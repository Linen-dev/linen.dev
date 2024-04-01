import React from 'react';
import StickyHeader from '@/StickyHeader';
import styles from './index.module.scss';
import { SerializedUser } from '@linen/types';
import { SerializedChannel } from '@linen/types';
import IntegrationsModalUI from '@/IntegrationsModal';
import type { ApiClient } from '@linen/api-client';

interface Props {
  className?: string;
  channel: SerializedChannel;
  children?: React.ReactNode;
  currentUser?: SerializedUser | null;
  api: ApiClient;
}

export default function Header({
  className,
  channel,
  children,
  currentUser,
  api,
}: Props) {
  return (
    <StickyHeader id="chat-layout-header" className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          #{channel.channelName}
          <IntegrationsModalUI.ShowIntegrationDetail
            api={api}
            channel={channel}
            isUserAuthenticated={!!currentUser?.id}
            key={channel.id}
          />
        </div>
      </div>
      {children}
    </StickyHeader>
  );
}
