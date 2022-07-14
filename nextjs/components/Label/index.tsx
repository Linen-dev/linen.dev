import React from 'react';
import styles from './index.module.css';

interface Props {
  htmlFor: string;
  children: React.ReactNode;
}

export default function Label({ htmlFor, children }: Props) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
    </label>
  );
}
