import classNames from 'classnames';
import React from 'react';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  onClick?(): void;
}

function Badge({ className, children, onClick }: Props) {
  return (
    <span
      className={classNames(styles.badge, className, {
        [styles.action]: onClick,
      })}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

export default Badge;
