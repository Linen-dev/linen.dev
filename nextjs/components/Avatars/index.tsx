import React from 'react';
import Avatar, { Size } from '../Avatar';
import styles from './index.module.css';

interface AvatarType {
  src?: string | null;
  alt?: string | null;
  text: string;
  size?: Size;
}

export default function Avatars({ users }: { users: AvatarType[] }) {
  const avatars = users.slice(0, 2);
  if (avatars.length === 0) {
    return <></>;
  }
  return (
    <div className={styles.group}>
      {avatars.map((user, index) => (
        <div key={`${user.text}-${index}`} className={styles.item}>
          <Avatar key={`${index}-avatar`} {...user} />
        </div>
      ))}
      {users.length > 2 && (
        <div className={styles.item}>
          <div className={styles.placeholder}>{`+${users.length - 2}`}</div>
        </div>
      )}
    </div>
  );
}
