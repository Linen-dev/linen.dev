import classNames from 'classnames';
import React from 'react';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  type?: 'info' | 'success';
  onClick?(): void;
}

function Badge({ className, children, type, onClick }: Props) {
  return (
    <span
      className={classNames(styles.badge, className, {
        [styles.success]: type === 'success',
        [styles.action]: onClick,
      })}
      onClick={onClick}
    >
      {children}
    </span>
  );
}

export default Badge;
