import React from 'react';
import styles from './index.module.css';
import { normalizeCode } from '../utilities/string';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  return <code className={styles.code}>{normalizeCode(value)}</code>;
}
