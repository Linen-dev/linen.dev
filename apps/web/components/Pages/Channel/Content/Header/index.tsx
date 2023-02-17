import React from 'react';
import { Dropdown, NativeSelect, StickyHeader } from '@linen/ui';
import styles from './index.module.css';
import { SerializedThread, SerializedUser, ThreadStatus } from '@linen/types';
import { FiHash, FiMoreVertical } from 'react-icons/fi';
import { BiMessageCheck } from 'react-icons/bi';
import Icon from './Icon';
import { BsFillGearFill } from 'react-icons/bs';
import { ShowIntegrationDetail } from '../IntegrationsModal';

interface Props {
  className?: string;
  channelName: string;
  children: React.ReactNode;
  currentUser?: SerializedUser;
  status: ThreadStatus;
  threads: SerializedThread[];
  onMarkAllAsRead(): void;
  onStatusChange(status: ThreadStatus): void;
  handleOpenIntegrations(): void;
}

export default function Header({
  className,
  channelName,
  children,
  currentUser,
  status,
  threads,
  onMarkAllAsRead,
  onStatusChange,
  handleOpenIntegrations,
}: Props) {
  return (
    <StickyHeader className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channelName}
          <ShowIntegrationDetail />
        </div>
        {currentUser && (
          <div className={styles.actions}>
            <div className={styles.select}>
              <NativeSelect
                id="user-thread-status"
                theme="gray"
                value={status}
                options={[
                  { label: 'Inbox', value: ThreadStatus.UNREAD },
                  { label: 'Done', value: ThreadStatus.READ },
                  { label: 'Muted', value: ThreadStatus.MUTED },
                  { label: 'Later', value: ThreadStatus.REMINDER },
                ]}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  onStatusChange(event.target.value as ThreadStatus);
                  document.getElementById('user-thread-status')?.blur();
                }}
              />
            </div>
            {status === ThreadStatus.UNREAD && (
              <Dropdown
                button={
                  <Icon>
                    <FiMoreVertical />
                  </Icon>
                }
                items={[
                  ...(threads.length > 0
                    ? [
                        {
                          icon: <BiMessageCheck />,
                          label: 'Mark all as done',
                          onClick: onMarkAllAsRead,
                        },
                      ]
                    : []),
                  {
                    icon: <BsFillGearFill />,
                    label: 'Integrations',
                    onClick: handleOpenIntegrations,
                  },
                ]}
              />
            )}
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
