import React from 'react';
import Image from 'next/image';
import { users } from '@prisma/client';
import { MessageFormat } from '@linen/types';
import { Avatar, Message } from '@linen/ui';
import styles from './index.module.css';
import { SerializedUser } from '@linen/types';

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
          src={user?.profileImageUrl}
          text={user?.displayName}
          Image={Image}
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
