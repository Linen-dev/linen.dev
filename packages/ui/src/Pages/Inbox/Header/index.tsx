import React from 'react';
import Dropdown, { DropdownItem } from '../../../Dropdown';
import StickyHeader from '../../../StickyHeader';
import Pagination from './Pagination';
import Icon from './Icon';
import { FiInbox, FiPlus, FiMoreVertical } from 'react-icons/fi';
import styles from './index.module.scss';
import { SerializedThread } from '@linen/types';

interface Props {
  page: number;
  total: number;
  onAddClick(): void;
  onPageChange(type: string): void;
  dropdown: DropdownItem[];
}

export default function Header({
  page,
  total,
  onAddClick,
  onPageChange,
  dropdown,
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
          <Icon onClick={onAddClick}>
            <FiPlus />
          </Icon>
          {dropdown.length > 0 && (
            <Dropdown
              button={
                <Icon>
                  <FiMoreVertical />
                </Icon>
              }
              items={dropdown}
            />
          )}
          <Pagination page={page} total={total} onPageChange={onPageChange} />
        </div>
      </div>
    </StickyHeader>
  );
}
