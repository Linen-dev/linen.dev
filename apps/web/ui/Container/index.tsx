import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function Container({ className, children }: Props) {
  return (
    <div className={classNames(styles.container, className)}>{children}</div>
  );
}
