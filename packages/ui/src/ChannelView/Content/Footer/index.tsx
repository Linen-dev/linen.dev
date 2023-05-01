import React from 'react';
import styles from './index.module.scss';
import PoweredByLinen from '@/PoweredByLinen';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <PoweredByLinen />
    </footer>
  );
}
