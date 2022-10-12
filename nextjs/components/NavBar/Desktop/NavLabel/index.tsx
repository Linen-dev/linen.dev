import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function NavLabel({ children }: Props) {
  return <div className={styles.label}>{children}</div>;
}
