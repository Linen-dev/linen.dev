import React from 'react';
import { StickyHeader } from '@linen/ui';
import styles from './index.module.css';
import { SerializedUser } from '@linen/types';
import { NativeSelect } from '@linen/ui';
import { FiHash } from 'react-icons/fi';
import { ThreadStatus } from '@linen/types';
import ThreadStatusIcon from '../ThreadStatusIcon';

interface Props {
  className?: string;
  channelName: string;
  children: React.ReactNode;
  currentUser?: SerializedUser;
  status: ThreadStatus;
  onStatusChange(status: ThreadStatus): void;
}

export default function Header({
  className,
  channelName,
  children,
  currentUser,
  status,
  onStatusChange,
}: Props) {
  return (
    <StickyHeader className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channelName}
        </div>
        {currentUser && (
          <div className={styles.select}>
            <NativeSelect
              id="user-thread-status"
              icon={<ThreadStatusIcon status={status} />}
              theme="gray"
              value={status}
              options={[
                { label: 'Inbox', value: ThreadStatus.UNREAD },
                { label: 'Read', value: ThreadStatus.READ },
                { label: 'Muted', value: ThreadStatus.MUTED },
              ]}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                onStatusChange(event.target.value as ThreadStatus);
                document.getElementById('user-thread-status')?.blur();
              }}
            />
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
