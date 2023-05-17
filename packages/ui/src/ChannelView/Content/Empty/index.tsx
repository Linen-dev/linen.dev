import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiMessageSquare } from '@react-icons/all-files/fi/FiMessageSquare';
import { FiPaperclip } from '@react-icons/all-files/fi/FiPaperclip';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';

interface Props {
  onShare?(): void;
  onInvite?(): void;
}

export default function Empty({ onInvite, onShare }: Props) {
  return (
    <div className={classNames(styles.container, styles.stripe)}>
      <div className={styles.icon}>
        <FiMessageSquare />
      </div>
      <h2 className={styles.header}>Nothing is here.</h2>
      {onInvite && (
        <a className={styles.button} onClick={onInvite}>
          <FiUsers /> Invite members
        </a>
      )}
      {onShare && (
        <a className={styles.button} onClick={onShare}>
          <FiPaperclip />
          Share the link
        </a>
      )}
    </div>
  );
}
