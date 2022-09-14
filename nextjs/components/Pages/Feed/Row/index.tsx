import React, { useState } from 'react';
import Avatar, { Size } from 'components/Avatar';
import styles from './index.module.css';
import Link from 'components/Link/InternalLink';
import { ThreadState } from '@prisma/client';
import { SerializedThread } from 'serializers/thread';
import { format } from 'utilities/date';

interface Props {
  thread: SerializedThread;
  onClose(id: string, state: ThreadState): void;
}

export default function Row({ thread, onClose }: Props) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const message = thread.messages[0];
  const href = `/t/${thread.incrementId}/${
    thread.slug || 'topic'
  }`.toLowerCase();
  const date = format(thread.sentAt);
  const { state, channel, id } = thread;
  return (
    <div className={styles.row}>
      <div className={styles.content}>
        <div
          className={styles.body}
          onClick={() => setExpanded((expanded) => !expanded)}
        >
          <Avatar
            size={Size.md}
            alt={message.author?.displayName || 'avatar'}
            src={message.author?.profileImageUrl}
            text={(message.author?.displayName || '?')
              .slice(0, 1)
              .toLowerCase()}
          />
          <div>
            <div>
              {channel && <span className="mr-1">#{channel.channelName}</span>}
              <span className={styles.date}>{date}</span>
            </div>
            <div className={styles.message}>
              {message.author?.displayName || 'User'}: {message.body}
            </div>
          </div>
        </div>
        {expanded && (
          <ul className={styles.links}>
            <li>
              <Link href={href}>View</Link>
            </li>
            <li>
              {state === ThreadState.OPEN && (
                <a onClick={() => onClose(id, ThreadState.CLOSE)}>Close</a>
              )}
              {state === ThreadState.CLOSE && (
                <a onClick={() => onClose(id, ThreadState.OPEN)}>Reopen</a>
              )}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
