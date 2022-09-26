import React, { useState } from 'react';
import classNames from 'classnames';
import Avatar, { Size } from 'components/Avatar';
import Checkbox from 'components/Checkbox';
import styles from './index.module.css';
import Link from 'components/Link/InternalLink';
import { SerializedThread } from 'serializers/thread';
import { format } from 'utilities/date';

interface Props {
  thread: SerializedThread;
  selected: boolean;
  onChange(id: string, checked: boolean): void;
}

function threadUrl(thread: SerializedThread): string {
  const { incrementId, slug } = thread;
  if (slug) {
    return `/t/${incrementId}/${slug}`.toLowerCase();
  }
  return `/t/${incrementId}`;
}

export default function Row({ thread, selected, onChange }: Props) {
  const message = thread.messages[0];
  const href = threadUrl(thread);
  const date = format(message.sentAt);
  const { channel, id } = thread;
  return (
    <div className={classNames(styles.row, { [styles.selected]: selected })}>
      <div className={styles.content}>
        <Checkbox
          checked={selected}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            event.stopPropagation();
            const { checked } = event.target;
            onChange(id, checked);
          }}
        />
        <Link className={styles.body} href={href}>
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
        </Link>
      </div>
    </div>
  );
}
