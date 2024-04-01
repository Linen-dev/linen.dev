import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  onClick?(): void;
}

export default function Group({ className, children, onClick }: Props) {
  return (
    <div
      className={classNames(styles.group, className, {
        [styles.action]: onClick,
      })}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
