import React from 'react';
import { SerializedThread } from '@linen/types';
import { Selections } from '../types';
import { Permissions } from '@linen/types';
import { Pages } from '@linen/ui';

const { Row } = Pages.Feed;

interface Props {
  threads: SerializedThread[];
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
  if (threads.length === 0 || loading) {
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
