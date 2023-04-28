import React from 'react';
import UserMessage from '../../../UserMessage/Summary';
import { ReminderTypes, SerializedThread } from '@linen/types';
// import Actions from './Actions';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  active: boolean;
  onClick(): void;
  onRead?(threadId: string): void;
  onMute?(threadId: string): void;
  onUnstar?(threadId: string): void;
  onRemind?(threadId: string, reminderType: ReminderTypes): void;
}

export default function Row({
  thread,
  active,
  onClick,
  onRead,
  onMute,
  onRemind,
  onUnstar,
}: Props) {
  return (
    <UserMessage
      className={styles.row}
      thread={thread}
      selected={false}
      active={active}
      onClick={onClick}
    >
      {/* this was me? */}
      {/* <Actions
        className={styles.actions}
        thread={thread}
        onRead={onRead}
        onMute={onMute}
        onRemind={onRemind}
        onUnstar={onUnstar}
      /> */}
    </UserMessage>
  );
}
