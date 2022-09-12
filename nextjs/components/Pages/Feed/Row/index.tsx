import React from 'react';
import Avatar, { Size } from 'components/Avatar';
import styles from './index.module.css';

interface Props {
  title?: string | null;
  date: string;
  message: any;
}

export default function Row({ title, date, message }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.content}>
        <Avatar
          size={Size.md}
          alt={message.author?.displayName || 'avatar'}
          src={message.author?.profileImageUrl}
          text={(message.author?.displayName || '?').slice(0, 1).toLowerCase()}
        />
        <div>
          <div>
            {title} <span className={styles.date}>{date}</span>
          </div>
          <div className={styles.message}>
            {message.author?.displayName || 'User'}: {message.body}
          </div>
        </div>
      </div>
      <div className={styles.channel}># general</div>
    </div>
  );
}
