import React from 'react';
import styles from './index.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a href="https://linen.dev" target="_blank" rel="noreferrer">
        Powered by Linen
      </a>
    </footer>
  );
}
