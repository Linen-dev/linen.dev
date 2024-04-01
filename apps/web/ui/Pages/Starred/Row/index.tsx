import React from 'react';
import UserMessage from '@/UserMessage/Summary';
import { ReminderTypes, SerializedThread, SerializedUser } from '@linen/types';
import Actions from './Actions';
import styles from './index.module.scss';
import { isAuthorActive } from '@linen/utilities/isAuthorActive';

interface Props {
  thread: SerializedThread;
  active: boolean;
  onClick(): void;
  onRead?(threadId: string): void;
  onMute?(threadId: string): void;
  onUnstar?(threadId: string): void;
  onRemind?(threadId: string, reminderType: ReminderTypes): void;
  currentUser: SerializedUser | null;
  activeUsers: string[];
}

export default function Row({
  thread,
  active,
  onClick,
  onRead,
  onMute,
  onRemind,
  onUnstar,
  currentUser,
  activeUsers,
}: Props) {
  return (
    <UserMessage
      className={styles.row}
      thread={thread}
      selected={false}
      active={active}
      onClick={onClick}
      isAuthorActive={isAuthorActive(
        thread.messages[thread.messages.length - 1]?.author,
        currentUser,
        activeUsers
      )}
    >
      <Actions
        className={styles.actions}
        thread={thread}
        // onRead={onRead}
        // onMute={onMute}
        // onRemind={onRemind}
        onUnstar={onUnstar}
      />
    </UserMessage>
  );
}
