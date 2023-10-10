import React from 'react';
import Logo from '../Logo';
import styles from './index.module.scss';

export default function SplashLayout() {
  return (
    <div className={styles.container}>
      <Logo />
    </div>
  );
}
