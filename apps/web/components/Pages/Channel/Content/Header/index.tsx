import React, { useState } from 'react';
import { StickyHeader } from '@linen/ui';
import { BiMessageRoundedCheck, BiMessageRoundedDetail } from 'react-icons/bi';
import styles from './index.module.css';
import classNames from 'classnames';
import { SerializedUser } from '@linen/types';
import { NativeSelect } from '@linen/ui';
import { FaVolumeMute } from 'react-icons/fa';
import { FiHash, FiInbox } from 'react-icons/fi';
import { ThreadStatus } from '@linen/types';

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
  function getIcon(status: ThreadStatus) {
    switch (status) {
      case ThreadStatus.UNREAD:
        return <FiInbox />;
      case ThreadStatus.READ:
        return <BiMessageRoundedCheck />;
      case ThreadStatus.MUTED:
        return <FaVolumeMute />;
    }
  }

  return (
    <StickyHeader className={classNames(styles.header, className)}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channelName}
        </div>
        {currentUser && (
          <div className={styles.select}>
            <NativeSelect
              id="user-thread-status"
              icon={getIcon(status)}
              theme="gray"
              value={status}
              options={[
                { label: 'Inbox', value: ThreadStatus.UNREAD },
                { label: 'Read', value: ThreadStatus.READ },
                { label: 'Muted', value: ThreadStatus.MUTED },
              ]}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onStatusChange(event.target.value as ThreadStatus)
              }
            />
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
