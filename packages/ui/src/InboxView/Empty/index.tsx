import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';

interface Props {
  loading: boolean;
}

export default function Empty({ loading }: Props) {
  if (loading) {
    return <div className={styles.container}></div>;
  }
  return (
    <div className={classNames(styles.container, styles.stripe)}>
      <div className={styles.icon}>
        <FiInbox />
      </div>
      <h2 className={styles.header}>Inbox Zero.</h2>
    </div>
  );
}
