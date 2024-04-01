import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
}

export default function Spinner({ className }: Props) {
  return (
    <div className={classNames(styles.spinner, className)}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
