import React from 'react';
import UserMessage from '../../../UserMessage/Summary';
import { ReminderTypes, SerializedThread } from '@linen/types';
import Actions from './Actions';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  selected: boolean;
  active: boolean;
  onClick(): void;
  onRead?(threadId: string): void;
  onMute?(threadId: string): void;
  onStar?(threadId: string): void;
  onRemind?(threadId: string, reminderType: ReminderTypes): void;
}

export default function Row({
  thread,
  selected,
  active,
  onClick,
  onRead,
  onMute,
  onStar,
  onRemind,
}: Props) {
  return (
    <UserMessage
      className={styles.row}
      thread={thread}
      selected={selected}
      active={active}
      onClick={onClick}
    >
      <Actions
        className={styles.actions}
        thread={thread}
        onRead={onRead}
        onMute={onMute}
        onRemind={onRemind}
        onStar={onStar}
      />
    </UserMessage>
  );
}
