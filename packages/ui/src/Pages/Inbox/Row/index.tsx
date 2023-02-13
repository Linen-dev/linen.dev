import React from 'react';
import classNames from 'classnames';
import Avatar from '../../../Avatar';
import Checkbox from '../../../Checkbox';
import { Permissions, SerializedThread } from '@linen/types';
import Title from './Title';
import Description from './Description';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  selected: boolean;
  permissions: Permissions;
  onChange(id: string, checked: boolean): void;
  onClick(): void;
}

export default function Row({
  thread,
  selected,
  permissions,
  onChange,
  onClick,
}: Props) {
  const message = thread.messages[thread.messages.length - 1];
  const { channel, id } = thread;
  return (
    <div className={classNames(styles.row, { [styles.selected]: selected })}>
      <div className={styles.body} onClick={onClick}>
        <Avatar
          src={message.author?.profileImageUrl}
          text={message.author?.displayName}
        />
        <div className={styles.line}>
          <Title thread={thread} />
          <Description thread={thread} />
        </div>
      </div>
    </div>
  );
}
