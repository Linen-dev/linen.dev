import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Title({ children }: Props) {
  return <div className={styles.title}>{children}</div>;
}
