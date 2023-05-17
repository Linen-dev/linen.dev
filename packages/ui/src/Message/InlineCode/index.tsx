import React from 'react';
import Code from '@/Code';
import { decodeHTML } from '@linen/utilities/string';
import styles from './index.module.scss';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  const input = value.trim();
  const content = decodeHTML(input);
  return <Code className={styles.code} content={content} inline />;
}
