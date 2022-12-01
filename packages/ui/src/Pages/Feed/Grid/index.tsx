import React from 'react';
import { Permissions, SerializedThread } from '@linen/types';
import Row from '../Row';

interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}

interface Props {
  threads?: SerializedThread[];
  selections: Selections;
  permissions: Permissions;
  loading: boolean;
  onChange(id: string, checked: boolean, index: number): void;
  onSelect(thread: SerializedThread): void;
}

export default function Grid({
  threads,
  selections,
  permissions,
  loading,
  onChange,
  onSelect,
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
            permissions={permissions}
            onChange={(id: string, checked: boolean) =>
              onChange(id, checked, index)
            }
            onClick={() => onSelect(thread)}
          />
        );
      })}
    </>
  );
}
