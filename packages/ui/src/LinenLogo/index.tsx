import React from 'react';
import styles from './index.module.scss';
import LinenIcon from '@/LinenIcon';

export default function LinenLogo() {
  return (
    <div className={styles.container}>
      <LinenIcon />
      <div className={styles.text}>Linen</div>
    </div>
  );
}
