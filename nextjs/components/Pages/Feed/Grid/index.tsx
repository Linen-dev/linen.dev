import React from 'react';
import Row from '../Row';
import { SerializedThread } from 'serializers/thread';
import { format } from 'utilities/date';

interface Props {
  threads: SerializedThread[];
  loading: boolean;
}

export default function Grid({ threads, loading }: Props) {
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
            title={thread.title}
            date={format(thread.sentAt)}
            message={message}
          />
        );
      })}
    </>
  );
}
