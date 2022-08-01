import React from 'react';
import { users } from '@prisma/client';
import Avatar, { Size } from '../../Avatar';
import Message from '../../Message';
import styles from './index.module.css';

interface Props {
  body: string;
  mentions: any[];
  user?: users;
  channelName?: string;
}

export default function Suggestion({
  body,
  mentions,
  user,
  channelName,
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Avatar
          size={Size.sm}
          src={user?.profileImageUrl || ''}
          alt={user?.displayName || ''}
          text={(user?.displayName || '?').slice(0, 1).toLowerCase()}
        />
        <div className={styles.text}>
          <strong>{user?.displayName}</strong>
          {channelName && (
            <strong className={styles.channel}>#{channelName}</strong>
          )}
        </div>
      </div>
      <Message
        text={body}
        truncate
        mentions={mentions.map((m: any) => m.users) || []}
      />
    </div>
  );
}
