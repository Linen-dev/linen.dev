import React from 'react';
import StickyHeader from '@/StickyHeader';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiUsers /> Members
      </div>
      <div className={styles.subtitle}>
        Invite and change roles of members in your community
      </div>
    </StickyHeader>
  );
}
