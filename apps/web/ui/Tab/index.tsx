import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  active?: boolean;
  id: string;
  header: React.ReactNode;
  onClick(id: string): void;
}

export default function Tab({ active, id, header, onClick }: Props) {
  return (
    <div
      className={classNames(styles.tab, { [styles.active]: active })}
      onClick={() => onClick(id)}
    >
      {header}
    </div>
  );
}
