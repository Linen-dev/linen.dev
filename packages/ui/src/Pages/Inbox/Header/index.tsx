import React from 'react';
import Dropdown from '../../../Dropdown';
import StickyHeader from '../../../StickyHeader';
import Pagination from './Pagination';
import Icon from './Icon';
import { FiInbox, FiMoreVertical } from 'react-icons/fi';
import { BiMessageCheck } from 'react-icons/bi';
import styles from './index.module.scss';
import { SerializedThread } from '@linen/types';

interface Props {
  page: number;
  total: number;
  threads: SerializedThread[];
  onPageChange(type: string): void;
  onMarkAllAsRead(): void;
  isFetchingTotal: boolean;
}

export default function Header({
  page,
  total,
  threads,
  onPageChange,
  onMarkAllAsRead,
  isFetchingTotal,
}: Props) {
  return (
    <StickyHeader>
      <div className={styles.container}>
        <div>
          <StickyHeader.Title>
            <FiInbox /> Inbox
          </StickyHeader.Title>
          <StickyHeader.Subtitle>
            All of your channel conversations in one place
          </StickyHeader.Subtitle>
        </div>
        <div className={styles.right}>
          {threads.length > 0 && (
            <Dropdown
              button={
                <Icon>
                  <FiMoreVertical />
                </Icon>
              }
              items={[
                {
                  icon: <BiMessageCheck />,
                  label: 'Mark all as done',
                  onClick: onMarkAllAsRead,
                },
              ]}
            />
          )}
          <Pagination
            page={page}
            total={total}
            onPageChange={onPageChange}
            isFetchingTotal={isFetchingTotal}
          />
        </div>
      </div>
    </StickyHeader>
  );
}
