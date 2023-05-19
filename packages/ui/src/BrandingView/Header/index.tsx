import React from 'react';
import StickyHeader from '@/StickyHeader';
import { FiSliders } from '@react-icons/all-files/fi/FiSliders';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiSliders /> Branding
      </div>
      <div className={styles.subtitle}>Design made simple</div>
    </StickyHeader>
  );
}
