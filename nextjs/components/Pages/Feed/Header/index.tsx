import React from 'react';
import StickyHeader from 'components/StickyHeader';
import { FiBox } from 'react-icons/fi';
import styles from './index.module.css';

export default function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiBox /> Feed
      </div>
      <div className="text-gray-600 text-xs">
        All of your channel conversations in one place
      </div>
    </StickyHeader>
  );
}
