import React from 'react';
import { ReminderTypes, SerializedThread } from '@linen/types';
import Row from '../Row';

interface Props {
  threads?: SerializedThread[];
  currentThreadId?: string;
  loading: boolean;
  onSelect(thread: SerializedThread): void;
  onRead?(threadId: string): void;
  onMute?(threadId: string): void;
  onUnstar?(threadId: string): void;
  onRemind?(threadId: string, reminderType: ReminderTypes): void;
}

export default function Grid({
  threads,
  currentThreadId,
  loading,
  onSelect,
  onRead,
  onMute,
  onRemind,
  onUnstar,
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
            active={thread.id === currentThreadId}
            onClick={() => onSelect(thread)}
            onRead={onRead}
            onMute={onMute}
            onRemind={onRemind}
            onUnstar={onUnstar}
          />
        );
      })}
    </>
  );
}
