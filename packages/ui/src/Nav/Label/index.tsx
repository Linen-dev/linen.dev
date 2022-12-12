import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Label({ children }: Props) {
  return <div className={styles.label}>{children}</div>;
}
