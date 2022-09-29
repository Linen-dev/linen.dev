import React from 'react';
import { users } from '@prisma/client';
import Avatar, { Size } from '../../Avatar';
import Message, { getMessageFormat } from '../../Message';
import styles from './index.module.css';

interface Props {
  body: string;
  externalId?: string;
  mentions: any[];
  user?: users;
  channelName?: string;
  communityType: string;
}

export default function Suggestion({
  body,
  externalId,
  mentions,
  user,
  channelName,
  communityType,
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
          <strong>{user?.displayName || 'user'}</strong>
          {channelName && (
            <strong className={styles.channel}>#{channelName}</strong>
          )}
        </div>
      </div>
      <Message
        text={body}
        format={getMessageFormat({ communityType, externalId })}
        mentions={mentions.map((m: any) => m.users) || []}
      />
    </div>
  );
}
