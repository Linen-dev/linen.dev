import React from 'react';
import Icon from '@/Icon';
import StickyHeader from '@/StickyHeader';
import styles from './index.module.scss';
import { SerializedUser } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiEdit3 } from '@react-icons/all-files/fi/FiEdit3';
import { Permissions, SerializedChannel } from '@linen/types';
import IntegrationsModalUI from '@/IntegrationsModal';
import type { ApiClient } from '@linen/api-client';

interface Props {
  className?: string;
  channel: SerializedChannel;
  children?: React.ReactNode;
  currentUser?: SerializedUser | null;
  permissions: Permissions;
  onAddClick?(): void;
  api: ApiClient;
}

export default function Header({
  className,
  channel,
  children,
  currentUser,
  permissions,
  onAddClick,
  api,
}: Props) {
  return (
    <StickyHeader id="chat-layout-header" className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channel.channelName}
          <IntegrationsModalUI.ShowIntegrationDetail
            api={api}
            channel={channel}
            isUserAuthenticated={!!currentUser?.id}
            key={channel.id}
          />
        </div>
        {currentUser && (
          <div className={styles.actions}>
            {permissions.chat && onAddClick && (
              <Icon onClick={onAddClick}>
                <FiEdit3 />
              </Icon>
            )}
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
