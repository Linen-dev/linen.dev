import React from 'react';
import {
  Permissions,
  ReminderTypes,
  SerializedThread,
  SerializedUser,
} from '@linen/types';
import Row from '../Row';

interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}

interface Props {
  threads?: SerializedThread[];
  currentThreadId?: string;
  selections: Selections;
  permissions: Permissions;
  loading?: boolean;
  onChange(id: string, checked: boolean, index: number): void;
  onSelect(thread: SerializedThread): void;
  onRead?(threadId: string): void;
  onStar?(threadId: string): void;
  onMute?(threadId: string): void;
  onRemind?(threadId: string, reminderType: ReminderTypes): void;
  currentUser: SerializedUser | null;
  activeUsers: string[];
}

export default function Grid({
  threads,
  currentThreadId,
  selections,
  permissions,
  loading,
  onChange,
  onSelect,
  onRead,
  onStar,
  onMute,
  onRemind,
  currentUser,
  activeUsers,
}: Props) {
  if (!threads || threads.length === 0 || loading) {
    return null;
  }
  return (
    <>
      {threads.map((thread) => {
        return (
          <Row
            key={thread.id}
            thread={thread}
            selected={!!selections[thread.id]?.checked}
            active={thread.id === currentThreadId}
            onClick={() => onSelect(thread)}
            onRead={onRead}
            onMute={onMute}
            onRemind={onRemind}
            onStar={onStar}
            currentUser={currentUser}
            activeUsers={activeUsers}
          />
        );
      })}
    </>
  );
}
