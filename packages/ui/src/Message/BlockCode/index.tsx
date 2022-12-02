import React from 'react';
import classNames from 'classnames';
import Code from '../../Code';
import { decodeHTML } from '@linen/utilities/string';
import { formatCode, isHighlighted, isFormattable } from './utilities';
import styles from './index.module.scss';

interface Props {
  value: string;
}

export default function BlockCode({ value }: Props) {
  const input = value.trim();
  const content = decodeHTML(input);
  return (
    <Code
      className={classNames(styles.code, 'block')}
      content={isFormattable(content) ? formatCode(content) : content}
      highlight={isHighlighted(value)}
    />
  );
}
