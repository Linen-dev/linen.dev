import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function List({ children }: Props) {
  return <div className={styles.list}>{children}</div>;
}
