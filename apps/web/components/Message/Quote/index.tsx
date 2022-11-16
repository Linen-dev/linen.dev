import React from 'react';
import styles from './index.module.css';

interface Props {
  children: React.ReactNode;
}

export default function Quote({ children }: Props) {
  return <blockquote className={styles.quote}>{children}</blockquote>;
}
