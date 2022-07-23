import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  name: string;
  active: boolean;
}

export default function ChannelName({ name, active }: Props) {
  return (
    <div className={classNames(styles.name, { [styles.active]: active })}>
      # {name}
    </div>
  );
}
