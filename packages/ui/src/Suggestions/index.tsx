import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { SerializedUser } from '@linen/types';

interface Props {
  className?: string;
  fetch?(): Promise<SerializedUser[]>;
  users: SerializedUser[];
  onSelect?(user: SerializedUser): void;
}

export default function Suggestions({ className, users, onSelect }: Props) {
  const [selection, setSelection] = useState(0);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.stopPropagation();
        setSelection((selection) => {
          if (users.length - 1 === selection) {
            return 0;
          }
          return selection + 1;
        });
      }
      if (event.key === 'ArrowUp') {
        event.stopPropagation();
        setSelection((selection) => {
          if (selection === 0) {
            return users.length - 1;
          }
          return selection - 1;
        });
      }
      if (event.key === 'Enter') {
        if (event.ctrlKey || event.shiftKey) {
          return;
        }
        event.stopPropagation();
        onSelect?.(users[selection]);
      }
    };
    document.addEventListener('keyup', handler);
    return () => {
      document.removeEventListener('keyup', handler);
    };
  }, [selection, users]);

  if (users.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ul className={classNames(styles.suggestions, className)}>
        {users.map((user: SerializedUser, index: Number) => {
          const { id, username, displayName } = user;
          return (
            <li
              key={id}
              className={classNames(styles.suggestion, {
                [styles.selected]: selection === index,
              })}
              onClick={() => onSelect?.(user)}
            >
              {displayName && (
                <>
                  <span className={styles.username}>{username}</span>
                  <span className={styles.name}>{displayName}</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
