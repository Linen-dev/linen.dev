import React, { useState } from 'react';
import Avatar, { Size } from 'components/Avatar';
import styles from './index.module.css';
import Link from 'components/Link/InternalLink';
import { ThreadState } from '@prisma/client';
import { SerializedThread } from 'serializers/thread';
import { format } from 'utilities/date';

interface Props {
  thread: SerializedThread;
}

export default function Row({ thread }: Props) {
  const message = thread.messages[0];
  const href = `/t/${thread.incrementId}/${
    thread.slug || 'topic'
  }`.toLowerCase();
  const date = format(thread.sentAt);
  const { state, channel, id } = thread;
  return (
    <div className={styles.row}>
      <div className={styles.content}>
        <Link href={href}>
          <div className={styles.body}>
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
                {channel && (
                  <span className="mr-1">#{channel.channelName}</span>
                )}
                <span className={styles.date}>{date}</span>
              </div>
              <div className={styles.message}>
                {message.author?.displayName || 'User'}: {message.body}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
