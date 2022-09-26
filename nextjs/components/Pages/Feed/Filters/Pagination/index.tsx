import React from 'react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import styles from './index.module.css';

export default function Pagination() {
  return (
    <div className={styles.pagination}>
      <div className={styles.back}>
        <BsChevronLeft />
      </div>
      <div className={styles.next}>
        <BsChevronRight />
      </div>
    </div>
  );
}
