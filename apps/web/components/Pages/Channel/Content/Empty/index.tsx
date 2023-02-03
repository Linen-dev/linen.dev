import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { ThreadStatus } from '@linen/types';
import ThreadStatusIcon from '../ThreadStatusIcon';

interface Props {
  status: ThreadStatus;
  loading: boolean;
}

function description(status: ThreadStatus) {
  switch (status) {
    case ThreadStatus.UNREAD:
      return 'Inbox Zero';
    case ThreadStatus.READ:
      return 'Done Zero';
    case ThreadStatus.MUTED:
      return 'Muted Zero';
    case ThreadStatus.REMINDER:
      return 'Later Zero';
  }
}

export default function Empty({ status, loading }: Props) {
  if (loading) {
    return <div className={styles.container}></div>;
  }
  return (
    <div className={classNames(styles.container, styles.stripe)}>
      <div className={styles.icon}>
        <ThreadStatusIcon status={status} />
      </div>
      <h2 className={styles.header}>{description(status)}</h2>
    </div>
  );
}
