import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Subtitle({ children }: Props) {
  return <div className={styles.subtitle}>{children}</div>;
}
