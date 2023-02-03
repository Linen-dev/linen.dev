import React from 'react';
import { Button, NativeSelect, StickyHeader } from '@linen/ui';
import styles from './index.module.css';
import { SerializedThread, SerializedUser, ThreadStatus } from '@linen/types';
import { FiHash } from 'react-icons/fi';

interface Props {
  className?: string;
  channelName: string;
  children: React.ReactNode;
  currentUser?: SerializedUser;
  status: ThreadStatus;
  threads: SerializedThread[];
  onMarkAllAsRead(): void;
  onStatusChange(status: ThreadStatus): void;
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
}: Props) {
  return (
    <StickyHeader className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channelName}
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
            {status === ThreadStatus.UNREAD && threads.length > 0 && (
              <Button onClick={onMarkAllAsRead} color="gray" weight="bold">
                All Done
              </Button>
            )}
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
