import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Icon({ children }: Props) {
  return <div className={styles.icon}>{children}</div>;
}
