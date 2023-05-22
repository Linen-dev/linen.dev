import React from 'react';
import StickyHeader from '@/StickyHeader';
import { FiBarChart } from '@react-icons/all-files/fi/FiBarChart';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiBarChart /> Metrics
      </div>
      <div className={styles.subtitle}>
        All of your community metrics in one place
      </div>
    </StickyHeader>
  );
}
