import React from 'react';
import classNames from 'classnames';
import { GoChevronLeft, GoChevronRight } from 'react-icons/go';
import styles from './index.module.scss';

interface Props {
  total: number;
  page: number;
  onPageChange(type: string): void;
  isFetchingTotal: boolean;
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
        <GoChevronLeft />
      </div>
      <div
        className={classNames(styles.icon, {
          [styles.disabled]: isNextDisabled,
        })}
        onClick={() => {
          !isNextDisabled && onPageChange('next');
        }}
      >
        <GoChevronRight />
      </div>
    </div>
  );
}
