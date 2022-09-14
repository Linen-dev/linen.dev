import React from 'react';
import Row from '../Row';
import { SerializedThread } from 'serializers/thread';
import { ThreadState } from '@prisma/client';

interface Props {
  threads: SerializedThread[];
  loading: boolean;
  onClose(id: string, state: ThreadState): void;
}

export default function Grid({ threads, loading, onClose }: Props) {
  if (threads.length === 0 || loading) {
    return null;
  }
  return (
    <>
      {threads.map((thread, index) => {
        return (
          <Row key={thread.id + index} thread={thread} onClose={onClose} />
        );
      })}
    </>
  );
}
