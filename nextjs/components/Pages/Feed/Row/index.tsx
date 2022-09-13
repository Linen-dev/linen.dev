import React, { useState } from 'react';
import classNames from 'classnames';
import Avatar, { Size } from 'components/Avatar';
import styles from './index.module.css';
import Link from 'components/Link/InternalLink';
import Checkbox from 'components/Checkbox';

interface Props {
  id: string;
  selected: boolean;
  href: string;
  date: string;
  message: any;
  onChange(id: string, checked: boolean): void;
}

export default function Row({
  id,
  selected,
  href,
  date,
  message,
  onChange,
}: Props) {
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
                #channel <span className={styles.date}>{date}</span>
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
