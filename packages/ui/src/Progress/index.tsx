import React from 'react';
import styles from './index.module.scss';

interface Props {
  max?: number;
  value: number;
  children?: React.ReactNode;
}

export default function Progress({ max, value, children }: Props) {
  return (
    <progress className={styles.progress} max={max || 100} value={value}>
      {children}
    </progress>
  );
}
