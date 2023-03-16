import React from 'react';
import styles from './index.module.scss';

export default function PoweredByLinen() {
  return (
    <a
      className={styles.link}
      target="_blank"
      rel="noreferrer"
      href="https://www.linen.dev"
    >
      Powered by Linen
    </a>
  );
}
