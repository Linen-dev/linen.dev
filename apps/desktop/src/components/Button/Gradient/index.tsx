import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?(): void;
}

export default function Button({ children, disabled, onClick }: Props) {
  return (
    <button onClick={onClick} disabled={disabled} className={styles.button}>
      {children}
    </button>
  );
}
