import React from 'react';
import styles from './index.module.scss';

interface Props {
  children?: React.ReactNode;
  onClick(): void;
}

export default function PinnedSection({ children, onClick }: Props) {
  return (
    <div className={styles.section} onClick={onClick}>
      {children}
    </div>
  );
}
