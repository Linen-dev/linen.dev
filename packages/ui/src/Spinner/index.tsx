import React from 'react';
import styles from './index.module.scss';

export default function Spinner() {
  return (
    <div className={styles.spinner}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
