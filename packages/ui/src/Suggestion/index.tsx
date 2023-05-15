import React from 'react';
import classNames from 'classnames';
import Avatar from '../Avatar';
import Message from '../Message';
import styles from './index.module.scss';
import { MessageFormat, SerializedUser } from '@linen/types';

interface Props {
  body: string;
  format: MessageFormat;
  mentions: SerializedUser[];
  user?: SerializedUser;
  channelName?: string;
  active?: boolean;
}

export default function Suggestion({
  body,
  format,
  mentions,
  user,
  channelName,
  active,
}: Props) {
  return (
    <div className={classNames(styles.container, { [styles.active]: active })}>
      <div className={styles.header}>
        <Avatar
          size="sm"
          src={user?.profileImageUrl}
          text={user?.displayName}
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
