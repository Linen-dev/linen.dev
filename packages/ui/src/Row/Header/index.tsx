import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { SerializedMessage, SerializedThread } from '@linen/types';
// import { format } from '@linen/utilities/date';

interface Props {
  thread: SerializedThread;
  message: SerializedMessage;
}

export default function Header({ thread, message }: Props) {
  const isTopic = thread.channel?.viewType === 'TOPIC';
  if (isTopic) {
    const index = thread.messages.findIndex(({ id }) => id === message.id);
    // const date = format(message.sentAt, 'p');
    const reply = index > 0;
    return (
      <div className={classNames(styles.header, { [styles.reply]: reply })}>
        {reply ? (
          <div className={styles.info}>
            <div className={styles.line}></div>
            {thread.title ||
              thread.messages[0].body.substring(0, 40).trim() + '...'}
          </div>
        ) : (
          <div className={styles.header}>
            {' '}
            <div className={styles.title}>
              {thread.title ||
                thread.messages[0].body.substring(0, 40).trim() + '...'}
            </div>
          </div>
        )}
      </div>
    );
  }
  if (thread.title) {
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
