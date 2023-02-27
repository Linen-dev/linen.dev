import React from 'react';
import styles from './index.module.scss';

export default function ErrorFallback() {
  return (
    <div className={styles.container}>
      <h1 className={styles.h1}>500</h1>
      <h6 className={styles.h6}>Something went wrong...</h6>
      <p className={styles.p}>
        Please try again later or contact us at{' '}
        <a className={styles.a} href="mailto:help@linen.dev">
          help@linen.dev
        </a>{' '}
        if the problem persists.
      </p>
    </div>
  );
}
