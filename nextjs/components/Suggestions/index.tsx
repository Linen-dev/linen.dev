import React from 'react';
import styles from './index.module.css';

interface User {
  username: string;
  name?: string;
}

interface Props {
  users: User[];
}

export default function Suggestions({ users }: Props) {
  return (
    <ul className={styles.suggestions}>
      {users.map(({ name, username }) => {
        return (
          <li key={username} className={styles.suggestion}>
            <span className={styles.username}>{username}</span>
            {name && <span className={styles.name}>{name}</span>}
          </li>
        );
      })}
    </ul>
  );
}
