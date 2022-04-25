import React from 'react';
import styles from './index.module.css';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  return <code className={styles.code}>{value}</code>;
}
