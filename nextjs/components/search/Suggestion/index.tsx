import React from 'react';
import { users, MessageFormat } from '@prisma/client';
import Avatar from '../../Avatar';
import Message from '../../Message';
import styles from './index.module.css';
import { SerializedUser } from 'serializers/user';

interface Props {
  body: string;
  format: MessageFormat;
  mentions: SerializedUser[];
  user?: users;
  channelName?: string;
}

export default function Suggestion({
  body,
  format,
  mentions,
  user,
  channelName,
}: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Avatar
          size="sm"
          src={user?.profileImageUrl || ''}
          alt={user?.displayName || ''}
          text={(user?.displayName || '?').slice(0, 1).toLowerCase()}
        />
        <div className={styles.text}>
          <strong>{user?.displayName || 'user'}</strong>
          {channelName && (
            <strong className={styles.channel}>#{channelName}</strong>
          )}
        </div>
      </div>
      <Message text={body} format={format} mentions={mentions} />
    </div>
  );
}
