import React from 'react';
import Row from '../Row';
import { ThreadState } from '@prisma/client';
import { SerializedThread } from 'serializers/thread';

interface Props {
  threads: SerializedThread[];
  state: ThreadState;
}

export default function Grid({ state, threads }: Props) {
  if (threads.length === 0) {
    return null;
  }
  return (
    <>
      {threads
        .filter((thread) => thread.state === state)
        .map((thread, index) => {
          const message = thread.messages[0];
          return (
            <Row
              key={message.body + index}
              title={thread.title}
              date="09/09/2022"
              message={message}
            />
          );
        })}
    </>
  );
}
