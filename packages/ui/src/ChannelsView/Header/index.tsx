import React from 'react';
import StickyHeader from '@/StickyHeader';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader className={styles.header}>
      <div className={styles.title}>
        <FiHash /> Channels
      </div>
      <div className={styles.subtitle}>Manage your channels.</div>
    </StickyHeader>
  );
}
