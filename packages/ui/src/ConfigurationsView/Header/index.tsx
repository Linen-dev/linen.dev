import React from 'react';
import StickyHeader from '@/StickyHeader';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader className={styles.header}>
      <div className={styles.title}>
        <FiSettings /> Configurations
      </div>
      <div className={styles.subtitle}>
        Manage your community integration, URLs and important community details
      </div>
    </StickyHeader>
  );
}
