import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Th({ children }: Props) {
  return <th className={styles.th}>{children}</th>;
}
