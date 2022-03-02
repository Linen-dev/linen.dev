import React from 'react';
import styles from './index.module.css';

function Field({ children }) {
  return <div className={styles.field}>{children}</div>;
}

export default Field;
