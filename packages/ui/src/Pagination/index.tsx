import React from 'react';
import Icon from '@/Icon';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
import styles from './index.module.scss';

interface Props {
  total: number;
  page: number;
  limit?: number;
  onPageChange(type: string): void;
}

export default function Pagination({
  total,
  page,
  limit,
  onPageChange,
}: Props) {
  limit = limit || 10;
  const lastPage = Math.ceil(total / limit);
  const isBackDisabled = page === 1;
  const isNextDisabled = total <= limit || page === lastPage;
  if (isBackDisabled && isNextDisabled) {
    return null;
  }
  return (
    <div className={styles.pagination}>
      <Icon
        disabled={isBackDisabled}
        onClick={() => {
          !isBackDisabled && onPageChange('back');
        }}
      >
        <FiChevronLeft />
      </Icon>
      <Icon
        disabled={isNextDisabled}
        onClick={() => {
          !isNextDisabled && onPageChange('next');
        }}
      >
        <FiChevronRight />
      </Icon>
    </div>
  );
}
