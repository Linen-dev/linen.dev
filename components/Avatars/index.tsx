import React from 'react';
import Avatar from '../Avatar';
import styles from './index.module.css';

interface AvatarType {
  src?: string;
  alt?: string;
  text: string;
}

interface Props {
  users: AvatarType[];
}

export default function Avatars({ users }: Props) {
  const avatars = users.slice(0, 3);
  if (avatars.length === 0) {
    return <></>;
  }
  return (
    <div
      className={styles.group}
      style={{ width: 36 + (avatars.length - 1) * 36 }}
    >
      {avatars.map((user, index) => (
        <div key={`${user.text}-${index}`} className={styles.item}>
          <Avatar key={`${index}-avatar`} {...user} />
        </div>
      ))}
      {users.length > 3 && (
        <div className={styles.item}>
          <div className={styles.placeholder}>{`+${users.length - 3}`}</div>
        </div>
      )}
    </div>
  );
}
