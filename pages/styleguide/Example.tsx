import React from 'react';
import styles from './Example.module.css';

interface Props {
  header: string;
  children: React.ReactNode;
}

export default function Example({ header, children }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.header}>{header}</h2>
      {children}
    </div>
  );
}
