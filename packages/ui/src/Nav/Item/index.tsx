import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
  active?: boolean;
  highlighted?: boolean;
}

export default function Item({ children, active, highlighted }: Props) {
  return (
    <div className={classNames(styles.item, { [styles.active]: active, [styles.highlighted]: highlighted })}>
      {children}
    </div>
  );
}
