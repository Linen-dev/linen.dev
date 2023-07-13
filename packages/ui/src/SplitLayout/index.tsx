import React from 'react';
import styles from './index.module.scss';

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function SplitLayout({ left, right }: Props) {
  return (
    <>
      <header className={styles.header}>
        <a href="/">
          <img width={108} height={24} src="/images/logo/white/linen.svg" />
        </a>
      </header>
      <div className={styles.grid}>
        <div className={styles.left}>{left}</div>
        <div className={styles.right}>{right}</div>
      </div>
      <div id="portal"></div>
      <div id="modal-portal"></div>
      <div id="tooltip-portal"></div>
      <div id="preview-portal"></div>
    </>
  );
}
