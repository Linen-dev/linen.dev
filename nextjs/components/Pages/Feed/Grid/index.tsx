import React from 'react';
import Row from '../Row';
import { SerializedThread } from 'serializers/thread';
import { format } from 'utilities/date';
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
        const message = thread.messages[0];
        return (
          <Row
            key={message.body + index}
            id={thread.id}
            state={thread.state}
            date={format(thread.sentAt)}
            message={message}
            href={`/t/${thread.incrementId}/${
              thread.slug || 'topic'
            }`.toLowerCase()}
            onClose={onClose}
          />
        );
      })}
    </>
  );
}
