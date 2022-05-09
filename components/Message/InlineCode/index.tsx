import React from 'react';
import styles from './index.module.css';
import { decodeHTML } from '../utilities/string';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  return <code className={styles.code}>{decodeHTML(value)}</code>;
}
