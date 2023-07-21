import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  active?: boolean;
  header: React.ReactNode;
  onClick(): void;
}

export default function Tab({ active, header, onClick }: Props) {
  return (
    <div
      className={classNames(styles.tab, { [styles.active]: active })}
      onClick={onClick}
    >
      {header}
    </div>
  );
}
