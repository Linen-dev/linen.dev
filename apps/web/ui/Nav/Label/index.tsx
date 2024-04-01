import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  onClick?(): void;
}

export default function Label({ className, children, onClick }: Props) {
  return (
    <div className={classNames(styles.label, className)} onClick={onClick}>
      {children}
    </div>
  );
}
