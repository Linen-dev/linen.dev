import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
}

export default function PoweredByLinen({ className }: Props) {
  return (
    <a
      className={classNames(styles.link, className)}
      target="_blank"
      rel="noreferrer"
      href="https://www.linen.dev"
    >
      Powered by
      <div className={styles.image} />
    </a>
  );
}
