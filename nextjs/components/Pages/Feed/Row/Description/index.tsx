import React from 'react';
import styles from './index.module.css';
import { SerializedMessage } from 'serializers/message';
import { format } from 'utilities/date';

interface Props {
  messages: SerializedMessage[];
}

export default function Description({ messages }: Props) {
  if (messages.length === 1) {
    const message = messages[0];
    const date = format(message.sentAt, 'Pp');
    return (
      <div className={styles.description}>
        {message.author?.displayName || 'User'} started this thread &middot;{' '}
        {date}
      </div>
    );
  }
  const message = messages[messages.length - 1];
  const date = format(message.sentAt, 'Pp');
  return (
    <div className={styles.description}>
      {message.author?.displayName || 'User'} replied to this thread &middot;{' '}
      {date}
    </div>
  );
}
