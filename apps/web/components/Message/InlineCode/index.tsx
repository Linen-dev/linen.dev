import React from 'react';
import { Code } from '@linen/ui';
import { decodeHTML } from '../utilities/string';
import styles from './index.module.css';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  const input = value.trim();
  const content = decodeHTML(input);
  return <Code className={styles.code} content={content} inline />;
}
