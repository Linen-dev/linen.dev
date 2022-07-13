import React from 'react';
import styles from './index.module.css';
import Code from 'components/Code';
import { decodeHTML } from '../utilities/string';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  const input = value.trim();
  const content = decodeHTML(input);
  return <Code className={styles.code} content={content} inline />;
}
