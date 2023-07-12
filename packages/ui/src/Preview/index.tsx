import React from 'react';
import styles from './index.module.scss';

interface Props {
  onClick(event: React.MouseEvent<HTMLDivElement>): void;
  children: React.ReactNode;
}

export default function Overlay({ onClick, children }: Props) {
  return (
    <div className={styles.preview} onClick={onClick}>
      {children}
    </div>
  );
}
