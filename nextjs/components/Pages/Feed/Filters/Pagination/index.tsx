import React from 'react';
import classNames from 'classnames';
import { GoChevronLeft, GoChevronRight } from 'react-icons/go';
import styles from './index.module.css';
import { CgSpinner } from 'react-icons/cg';

interface Props {
  total: number;
  page: number;
  onPageChange(type: string): void;
  isFetchingTotal: boolean;
}

interface Range {
  start: number;
  end: number;
}

function getRange(page: number, total: number): Range {
  const start = 1 + (page - 1) * 10;
  const end = (() => {
    if (total < 10) {
      return total;
    }
    const max = 10 * page;
    if (max > total) {
      return total;
    }
    return max;
  })();
  return {
    start,
    end,
  };
}

export default function Pagination({
  total,
  page,
  onPageChange,
  isFetchingTotal,
}: Props) {
  const { start, end } = getRange(page, total);
  const isBackDisabled = page === 1;
  const isNextDisabled = total <= 10 || end === total;
  return (
    <div className={styles.pagination}>
      <div className={styles.count}>
        {start}-{end} of{' '}
        {isFetchingTotal ? (
          <CgSpinner className="inline mb-1 animate-spin" />
        ) : (
          total
        )}
      </div>
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
