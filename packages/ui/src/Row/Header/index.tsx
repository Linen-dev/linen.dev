import React from 'react';
import Avatar from '@/Avatar';
import styles from './index.module.scss';
import { SerializedMessage, SerializedThread } from '@linen/types';
import { format } from '@linen/utilities/date';

interface Props {
  thread: SerializedThread;
  message: SerializedMessage;
}

export default function Header({ thread, message }: Props) {
  const isTopic = thread.channel?.viewType === 'TOPIC';
  if (thread.title || isTopic) {
    const index = thread.messages.findIndex(({ id }) => id === message.id);
    const date = format(message.sentAt, 'p');
    return (
      <div className={styles.header}>
        {isTopic && index > 0 && (
          <div className={styles.info}>
            <div className={styles.line}></div>
            <Avatar
              src={message.author?.profileImageUrl}
              text={message.author?.displayName}
              size="sm"
            />
            replied at {date}
          </div>
        )}
        <div className={styles.title}>
          {thread.title ||
            thread.messages[0].body.substring(0, 40).trim() + '...'}
        </div>
      </div>
    );
  }
  return null;
}
