import React from 'react';
import classNames from 'classnames';
import Avatar from '../../../Avatar';
import Checkbox from '../../../Checkbox';
import { Permissions, SerializedThread } from '@linen/types';
import Title from './Title';
import Description from './Description';
import Actions from './Actions';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  selected: boolean;
  active: boolean;
  permissions: Permissions;
  onChange(id: string, checked: boolean): void;
  onClick(): void;
  onRead?(threadId: string): void;
}

export default function Row({
  thread,
  selected,
  active,
  permissions,
  onChange,
  onClick,
  onRead,
}: Props) {
  const message = thread.messages[thread.messages.length - 1];
  return (
    <div
      className={classNames(styles.row, {
        [styles.selected]: selected,
        [styles.active]: active,
      })}
    >
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
      <Actions className={styles.actions} thread={thread} onRead={onRead} />
    </div>
  );
}
