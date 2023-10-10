import React from 'react';
import styles from './index.module.scss';

export default function ErrorLayout() {
  return (
    <div className={styles.container}>
      Something went wrong. Please refresh the page.
    </div>
  );
}
