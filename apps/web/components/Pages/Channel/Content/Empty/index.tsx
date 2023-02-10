import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { SerializedUser, ThreadStatus } from '@linen/types';
import ThreadStatusIcon from '../ThreadStatusIcon';
import { FiMessageSquare } from 'react-icons/fi';

interface Props {
  currentUser?: SerializedUser;
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

export default function Empty({ currentUser, status, loading }: Props) {
  if (!currentUser) {
    return (
      <div className={classNames(styles.container, styles.stripe)}>
        <div className={styles.icon}>
          <FiMessageSquare />
        </div>
        <h2 className={styles.header}>Nothing is here.</h2>
      </div>
    );
  }
  if (loading) {
    return <div className={styles.container}></div>;
  }
  return (
    <div className={classNames(styles.container, styles.stripe)}>
      <div className={styles.icon}>
        <ThreadStatusIcon status={status} />
      </div>
      <h2 className={styles.header}>{description(status)}.</h2>
    </div>
  );
}
