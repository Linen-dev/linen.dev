import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiMessageSquare } from '@react-icons/all-files/fi/FiMessageSquare';
import { FiPaperclip } from '@react-icons/all-files/fi/FiPaperclip';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';

interface Props {
  onShare?(): void;
  onInvite?(): void;
}

export default function Empty({ onInvite, onShare }: Props) {
  return (
    <div className={styles.container}>
      <FiMessageSquare className={styles.icon} />
      <h3 className={styles.header}>No conversations</h3>
      <p className={styles.description}>
        Get started by inviting people to the community.
      </p>
      <div className={styles.buttons}>
        {onInvite && (
          <a className={styles.button} onClick={onInvite}>
            <FiPlus /> Invite members
          </a>
        )}
        {onShare && (
          <a
            className={classNames(styles.button, styles.secondary)}
            onClick={onShare}
          >
            <FiPaperclip />
            Share the link
          </a>
        )}
      </div>
    </div>
  );
}
