import React from 'react';
import Avatar, { Size } from 'components/Avatar';
import styles from './index.module.css';
import Link from 'components/Link/InternalLink';

interface Props {
  href: string;
  date: string;
  message: any;
}

export default function Row({ href, date, message }: Props) {
  return (
    <div className={styles.row}>
      <Link href={href}>
        <div className={styles.content}>
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
              #channel <span className={styles.date}>{date}</span>
            </div>
            <div className={styles.message}>
              {message.author?.displayName || 'User'}: {message.body}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
