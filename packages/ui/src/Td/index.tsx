import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Td({ children }: Props) {
  return <td className={styles.td}>{children}</td>;
}
