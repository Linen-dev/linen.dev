import React from 'react';
import Row from '../Row';
import { SerializedThread } from 'serializers/thread';
import { format } from 'utilities/date';
import { Selections } from '../types';

interface Props {
  threads: SerializedThread[];
  loading: boolean;
  onChange(id: string, checked: boolean): void;
  selections: Selections;
}

export default function Grid({
  threads,
  selections,
  loading,
  onChange,
}: Props) {
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
            selected={selections[thread.id] === true}
            date={format(thread.sentAt)}
            message={message}
            href={`/t/${thread.incrementId}/${
              thread.slug || 'topic'
            }`.toLowerCase()}
            onChange={onChange}
          />
        );
      })}
    </>
  );
}
