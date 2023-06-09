import React from 'react';
import StickyHeader from '@/StickyHeader';
import Pagination from '@/Pagination';
import { FiStar } from '@react-icons/all-files/fi/FiStar';
import styles from './index.module.scss';

interface Props {
  page: number;
  total: number;
  onPageChange(type: string): void;
}

export default function Header({ page, total, onPageChange }: Props) {
  return (
    <StickyHeader className={styles.header}>
      <div className={styles.container}>
        <div>
          <StickyHeader.Title>
            <FiStar /> Starred
          </StickyHeader.Title>
          {/* <StickyHeader.Subtitle>
            All of your channel conversations in one place
          </StickyHeader.Subtitle> */}
        </div>
        <div className={styles.right}>
          <Pagination page={page} total={total} onPageChange={onPageChange} />
        </div>
      </div>
    </StickyHeader>
  );
}
