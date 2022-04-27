import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { normalizeCode } from '../utilities/string';

interface Props {
  value: string;
}

export default function BlockCode({ value }: Props) {
  return (
    <pre>
      <code className={classNames(styles.code, 'block')}>
        {normalizeCode(value)}
      </code>
    </pre>
  );
}
