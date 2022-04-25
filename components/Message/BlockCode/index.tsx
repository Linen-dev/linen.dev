import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  value: string;
}

export default function BlockCode({ value }: Props) {
  return (
    <pre>
      <code className={classNames(styles.code, 'block')}>{value}</code>
    </pre>
  );
}
