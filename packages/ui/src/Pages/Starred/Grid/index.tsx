import React from 'react';
import { ReminderTypes, SerializedThread } from '@linen/types';
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
  loading: boolean;
  onSelect(thread: SerializedThread): void;
  onRead?(threadId: string): void;
  onMute?(threadId: string): void;
  onRemind?(threadId: string, reminderType: ReminderTypes): void;
}

export default function Grid({
  threads,
  currentThreadId,
  selections,
  loading,
  onSelect,
  onRead,
  onMute,
  onRemind,
}: Props) {
  if (!threads || threads.length === 0 || loading) {
    return null;
  }
  return (
    <>
      {threads.map((thread, index) => {
        return (
          <Row
            key={thread.id + index}
            thread={thread}
            selected={!!selections[thread.id]?.checked}
            active={thread.id === currentThreadId}
            onClick={() => onSelect(thread)}
            onRead={onRead}
            onMute={onMute}
            onRemind={onRemind}
          />
        );
      })}
    </>
  );
}
