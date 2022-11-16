import React from 'react';
import styles from './index.module.scss';
import logo from 'assets/images/linen-white-logo.svg';

export default function Header() {
  return (
    <div className={styles.header}>
      <img src={logo.src} height="32" />
    </div>
  );
}
