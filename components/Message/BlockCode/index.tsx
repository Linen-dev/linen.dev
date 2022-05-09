import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { decodeHTML } from '../utilities/string';

interface Props {
  value: string;
}

export default function BlockCode({ value }: Props) {
  return (
    <pre>
      <code className={classNames(styles.code, 'block')}>
        {decodeHTML(value)}
      </code>
    </pre>
  );
}
