import React from 'react';
import styles from './index.module.scss';
import { SerializedThread } from '@linen/types';

interface Props {
  thread: SerializedThread;
}

export default function Header({ thread }: Props) {
  const isTopic = thread.channel?.viewType === 'TOPIC';
  if (thread.title || isTopic) {
    return (
      <div className={styles.header}>
        <div className={styles.title}>
          {thread.title ||
            thread.messages[0].body.substring(0, 40).trim() + '...'}
        </div>
      </div>
    );
  }
  return null;
}
