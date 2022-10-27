import React from 'react';
import StickyHeader from 'components/StickyHeader';
import { FiRss } from 'react-icons/fi';
import styles from './index.module.scss';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiRss /> Feed
      </div>
      <div className={styles.subtitle}>
        All of your channel conversations in one place
      </div>
    </StickyHeader>
  );
}
