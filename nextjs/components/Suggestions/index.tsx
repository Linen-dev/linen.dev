import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

export interface SuggestionUser {
  id: string;
  username: string;
  name?: string;
}

interface Props {
  className?: string;
  fetch(): Promise<SuggestionUser[]>;
  onSelect?(user: SuggestionUser): void;
}

export default function Suggestions({ className, fetch, onSelect }: Props) {
  const [selection, setSelection] = useState(0);
  const [users, setUsers] = useState<SuggestionUser[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch()
      .then((users: SuggestionUser[]) => {
        if (mounted) {
          setUsers(users);
        }
      })
      .catch(() => {
        if (mounted) {
          // notify the backend
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

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
        if (event.ctrlKey) {
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
    <ul className={classNames(styles.suggestions, className)}>
      {users.map((user: SuggestionUser, index: Number) => {
        const { username, name } = user;
        return (
          <li
            key={username}
            className={classNames(styles.suggestion, {
              [styles.selected]: selection === index,
            })}
            onClick={() => onSelect?.(user)}
          >
            <span className={styles.username}>@{username}</span>
            {name && <span className={styles.name}>{name}</span>}
          </li>
        );
      })}
    </ul>
  );
}
