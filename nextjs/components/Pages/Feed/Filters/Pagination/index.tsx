import React from 'react';
import classNames from 'classnames';
import { GoChevronLeft, GoChevronRight } from 'react-icons/go';
import styles from './index.module.css';

interface Props {
  total: number;
}

export default function Pagination({ total }: Props) {
  const start = 1;
  const end = total < 10 ? total : 10;
  return (
    <div className={styles.pagination}>
      <div className={styles.count}>
        {start}-{end} of {total}
      </div>
      <div className={classNames(styles.icon, { [styles.disabled]: true })}>
        <GoChevronLeft />
      </div>
      <div
        className={classNames(styles.icon, { [styles.disabled]: total < 10 })}
      >
        <GoChevronRight />
      </div>
    </div>
  );
}
