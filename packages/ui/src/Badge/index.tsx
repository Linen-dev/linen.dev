import classNames from 'classnames';
import React from 'react';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Badge({ className, children }: Props) {
  return (
    <span className={classNames(styles.badge, className)}>{children}</span>
  );
}

export default Badge;
