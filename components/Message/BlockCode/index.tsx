import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { decodeHTML } from '../utilities/string';
import { isHighlighted } from './utilities';
import Code from 'components/Code';

interface Props {
  value: string;
}

export default function BlockCode({ value }: Props) {
  return (
    <Code
      className={classNames(styles.code, 'block')}
      content={decodeHTML(value)}
      highlight={isHighlighted(value)}
    />
  );
}
