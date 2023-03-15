import React from 'react';
import classNames from 'classnames';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
import styles from './index.module.scss';

interface Props {
  total: number;
  page: number;
  onPageChange(type: string): void;
}

export default function Pagination({ total, page, onPageChange }: Props) {
  const isBackDisabled = page === 1;
  const lastPage = Math.ceil(total / 10);
  const isNextDisabled = total <= 10 || page === lastPage;
  if (isBackDisabled && isNextDisabled) {
    return null;
  }
  return (
    <div className={styles.pagination}>
      <div
        className={classNames(styles.icon, {
          [styles.disabled]: isBackDisabled,
        })}
        onClick={() => {
          !isBackDisabled && onPageChange('back');
        }}
      >
        <FiChevronLeft />
      </div>
      <div
        className={classNames(styles.icon, {
          [styles.disabled]: isNextDisabled,
        })}
        onClick={() => {
          !isNextDisabled && onPageChange('next');
        }}
      >
        <FiChevronRight />
      </div>
    </div>
  );
}
