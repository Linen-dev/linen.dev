import React from 'react';
import styles from './index.module.scss';

interface Props {
  children: React.ReactNode;
}

export default function Tbody({ children }: Props) {
  return <tbody className={styles.tbody}>{children}</tbody>;
}
