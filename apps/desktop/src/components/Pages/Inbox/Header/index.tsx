import React from 'react';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import logo from 'assets/images/linen-white-logo.svg';
import Avatar from '@linen/ui/Avatar';

export default function Header() {
  const router = useRouter();
  return (
    <div className={styles.header}>
      <img className={styles.logo} src={logo.src} height="32" />
      <div onClick={() => router.push('/')}>
        <Avatar className={styles.avatar} shadow="none" />
      </div>
    </div>
  );
}
