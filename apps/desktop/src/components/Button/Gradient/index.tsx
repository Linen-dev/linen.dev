import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
  onClick?(): void;
}

export default function Button({ children, onClick }: Props) {
  return (
    <button onClick={onClick} className={styles.button}>
      {children}
    </button>
  );
}
