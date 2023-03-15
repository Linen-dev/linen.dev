import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  onClick?(): void;
}

export default function Icon({ className, children, onClick }: Props) {
  return (
    <div className={classNames(className, styles.icon)} onClick={onClick}>
      {children}
    </div>
  );
}
