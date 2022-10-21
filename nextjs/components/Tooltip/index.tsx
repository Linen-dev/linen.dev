import React from 'react';
import styles from './index.module.scss';

interface Props {
  text: string;
  children: React.ReactNode;
}

export default function Tooltip({ text, children }: Props) {
  return (
    <span className={styles.tooltip} data-tooltip={text}>
      {children}
    </span>
  );
}
