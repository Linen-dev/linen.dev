import React from 'react';
import Container from '@linen/ui/Container';
import Link from 'next/link';
import logo from 'public/images/logo/white/linen.svg';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function SplitLayout({ className, children }: Props) {
  return (
    <>
      <header className={styles.header}>
        <Link href="/">
          <img width={108} height={24} src={logo.src} />
        </Link>
      </header>
      <Container className={className}>{children}</Container>
      <div id="portal"></div>
    </>
  );
}
