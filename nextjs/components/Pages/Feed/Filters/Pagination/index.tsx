import React from 'react';
import classNames from 'classnames';
import { GoChevronLeft, GoChevronRight } from 'react-icons/go';
import styles from './index.module.css';

export default function Pagination() {
  return (
    <div className={styles.pagination}>
      <div className={styles.count}>1-10 of 20 000</div>
      <div className={classNames(styles.icon, { [styles.disabled]: true })}>
        <GoChevronLeft />
      </div>
      <div className={styles.icon}>
        <GoChevronRight />
      </div>
    </div>
  );
}
