import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Thead({ children }: Props) {
  return <thead className={styles.thead}>{children}</thead>;
}
