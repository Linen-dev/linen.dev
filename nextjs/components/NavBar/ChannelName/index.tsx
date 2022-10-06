import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  name: string;
  highlighted: boolean;
  active: boolean;
}

export default function ChannelName({ name, highlighted, active }: Props) {
  return (
    <div
      className={classNames(styles.name, {
        [styles.active]: active,
        [styles.highlighted]: highlighted,
      })}
    >
      # {name}
    </div>
  );
}
