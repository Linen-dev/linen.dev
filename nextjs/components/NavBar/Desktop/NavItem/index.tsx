import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
  active?: boolean;
}

export default function NavItem({ children, active }: Props) {
  return (
    <div
      className={classNames(styles.name, {
        [styles.active]: active,
      })}
    >
      {children}
    </div>
  );
}
