import React from 'react';
import Link from 'next/link';
import logo from 'public/images/logo/white/linen.svg';
import styles from './index.module.scss';

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function SplitLayout({ left, right }: Props) {
  return (
    <>
      <header className={styles.header}>
        <Link href="/">
          <img width={108} height={24} src={logo.src} />
        </Link>
      </header>
      <div className={styles.grid}>
        <div className={styles.left}>{left}</div>
        <div className={styles.right}>{right}</div>
      </div>
      <div id="portal"></div>
    </>
  );
}
