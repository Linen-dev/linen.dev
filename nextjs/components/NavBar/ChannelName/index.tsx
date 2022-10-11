import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import Badge from 'components/Badge';

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
      # {name}
      {count > 0 && <Badge className="ml-2">{count}</Badge>}
    </div>
  );
}
