import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  text: string;
  children: React.ReactNode;
}

export default function Tooltip({ className, text, children }: Props) {
  return (
    <span className={classNames(styles.tooltip, className)} data-tooltip={text}>
      {children}
    </span>
  );
}
