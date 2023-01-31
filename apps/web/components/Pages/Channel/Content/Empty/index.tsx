import React from 'react';
import styles from './index.module.scss';
import { ThreadStatus } from '@linen/types';
import ThreadStatusIcon from '../ThreadStatusIcon';

interface Props {
  status: ThreadStatus;
}

function description(status: ThreadStatus) {
  switch (status) {
    case ThreadStatus.UNREAD:
      return 'Inbox Zero';
    case ThreadStatus.READ:
      return 'Read Zero';
    case ThreadStatus.MUTED:
      return 'Muted Zero';
  }
}

export default function Empty({ status }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>
        <ThreadStatusIcon status={status} />
      </div>
      <h2 className={styles.header}>{description(status)}</h2>
    </div>
  );
}
