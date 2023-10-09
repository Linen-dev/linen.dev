import React from 'react';
import Logo from '../Logo';
import styles from './index.module.scss';

export default function SplashLoader() {
  return (
    <div className={styles.container}>
      <Logo />
    </div>
  );
}
