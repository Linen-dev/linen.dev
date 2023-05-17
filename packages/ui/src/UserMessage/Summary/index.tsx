import React from 'react';
import classNames from 'classnames';
import Avatar from '@/Avatar';
import { SerializedThread } from '@linen/types';
import Title from './Title';
import Description from './Description';
import styles from './index.module.scss';

interface Props {
  className?: string;
  thread: SerializedThread;
  selected?: boolean;
  active?: boolean;
  children?: React.ReactNode;
  onClick(): void;
}

export default function Row({
  className,
  thread,
  selected,
  active,
  children,
  onClick,
}: Props) {
  const message = thread.messages[thread.messages.length - 1];
  return (
    <div
      className={classNames(styles.row, className, {
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
      {children}
    </div>
  );
}
