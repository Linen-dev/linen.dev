import React from 'react';
import StickyHeader from '../../../StickyHeader';
import Pagination from './Pagination';
import { FiRss } from 'react-icons/fi';
import styles from './index.module.scss';

interface Props {
  page: number;
  total: number;
  onPageChange(type: string): void;
  isFetchingTotal: boolean;
}

export default function Header({
  page,
  total,
  onPageChange,
  isFetchingTotal,
}: Props) {
  return (
    <StickyHeader>
      <div className={styles.container}>
        <div>
          <StickyHeader.Title>
            <FiRss /> Inbox
          </StickyHeader.Title>
          <StickyHeader.Subtitle>
            All of your channel conversations in one place
          </StickyHeader.Subtitle>
        </div>
        <Pagination
          page={page}
          total={total}
          onPageChange={onPageChange}
          isFetchingTotal={isFetchingTotal}
        />
      </div>
    </StickyHeader>
  );
}
