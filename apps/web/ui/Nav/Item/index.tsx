import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  active?: boolean;
  highlighted?: boolean;
}

export default function Item({
  className,
  children,
  active,
  highlighted,
}: Props) {
  return (
    <div
      className={classNames(styles.item, className, {
        [styles.active]: active,
        [styles.highlighted]: highlighted,
      })}
    >
      {children}
    </div>
  );
}
