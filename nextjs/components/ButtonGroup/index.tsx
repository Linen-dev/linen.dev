import React from 'react';
import styles from './index.module.css';

interface Props {
  children: React.ReactNode;
}

export default function ButtonGroup({ children }: Props) {
  return <div className={styles.group}>{children}</div>;
}
