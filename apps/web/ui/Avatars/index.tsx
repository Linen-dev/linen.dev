import React from 'react';
import Avatar, { Size } from '@/Avatar';
import styles from './index.module.scss';
import classNames from 'classnames';

interface AvatarType {
  src?: string | null;
  text?: string | null;
}

interface Props {
  users: AvatarType[];
  size?: Size;
  placeholder?: boolean;
  isBot: boolean;
}

export default function Avatars({ users, size, placeholder, isBot }: Props) {
  if (users.length === 0) {
    return <></>;
  }
  if (users.length > 3) {
    const avatars = users.slice(0, 2);
    return (
      <div className={styles.group}>
        {avatars.map((user, index) => (
          <div
            key={`${user.text}-${user.src || index}`}
            className={styles.item}
          >
            <Avatar
              key={`${user.text}-avatar`}
              text={user.text}
              src={user.src}
              size={size}
              placeholder={placeholder}
              shadow="sm"
              isBot={isBot}
            />
          </div>
        ))}
        <div className={styles.item}>
          <div
            className={classNames(styles.placeholder, size && styles[size])}
          >{`+${users.length - 2}`}</div>
        </div>
      </div>
    );
  }
  const avatars = users.slice(0, 3);
  return (
    <div className={styles.group}>
      {avatars.map((user, index) => (
        <div key={`${user.text}-${user.src || index}`} className={styles.item}>
          <Avatar
            key={`${user.text}-avatar`}
            text={user.text}
            src={user.src}
            size={size}
            placeholder={placeholder}
            shadow="sm"
            isBot={isBot}
          />
        </div>
      ))}
    </div>
  );
}
