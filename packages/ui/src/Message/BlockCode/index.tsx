import React from 'react';
import classNames from 'classnames';
import Code from '@/Code';
import { decodeHTML } from '@linen/utilities/string';
import { formatCode, isHighlighted, isFormattable } from './utilities';
import styles from './index.module.scss';

interface Props {
  value: string;
  placeholder?: boolean;
}

export default function BlockCode({ value, placeholder }: Props) {
  const input = value.trim();
  const content = decodeHTML(input);
  return (
    <Code
      className={classNames(styles.code, styles.block)}
      content={isFormattable(content) ? formatCode(content) : content}
      highlight={!placeholder && isHighlighted(value)}
    />
  );
}
