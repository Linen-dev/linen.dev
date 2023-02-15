import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
  onClick?(): void;
}

export default function Icon({ children, onClick }: Props) {
  return (
    <div className={styles.icon} onClick={onClick}>
      {children}
    </div>
  );
}
