import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { decodeHTML } from '../utilities/string';
import { formatCode, isHighlighted, isFormattable } from './utilities';
import Code from 'components/Code';

interface Props {
  value: string;
}

export default function BlockCode({ value }: Props) {
  const content = decodeHTML(value);
  return (
    <Code
      className={classNames(styles.code, 'block')}
      content={isFormattable(content) ? formatCode(content) : content}
      highlight={isHighlighted(value)}
    />
  );
}
