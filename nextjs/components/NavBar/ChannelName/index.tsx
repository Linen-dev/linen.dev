import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  name: string;
  count: number;
  active: boolean;
}

export default function ChannelName({ name, count, active }: Props) {
  return (
    <div
      className={classNames(styles.name, {
        [styles.active]: active,
      })}
    >
      {count > 0 ? `[${count}] #` : '#'} {name}
    </div>
  );
}
