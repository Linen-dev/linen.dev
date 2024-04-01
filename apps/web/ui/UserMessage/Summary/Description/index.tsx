import React from 'react';
import styles from './index.module.scss';
import { SerializedThread } from '@linen/types';
import { format } from '@linen/utilities/date';

interface Props {
  thread: SerializedThread;
}

export default function Description({ thread }: Props) {
  const { channel, messages } = thread;
  if (messages.length === 1) {
    const message = messages[0];
    const date = format(message.sentAt, 'Pp');
    return (
      <div className={styles.description}>
        {channel && <>#{channel.channelName} &middot; </>}
        {message.author?.displayName || 'User'} started this thread &middot;{' '}
        {date}
      </div>
    );
  }
  const message = messages[messages.length - 1];
  const date = format(message.sentAt, 'Pp');
  return (
    <div className={styles.description}>
      {channel && <>#{channel.channelName} &middot; </>}
      {message.author?.displayName || 'User'} replied to this thread &middot;{' '}
      {date}
    </div>
  );
}
