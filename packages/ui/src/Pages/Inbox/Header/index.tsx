import React from 'react';
import Dropdown, { DropdownItem } from '@/Dropdown';
import StickyHeader from '@/StickyHeader';
import Pagination from '@/Pagination';
import Icon from '@/Icon';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiEdit3 } from '@react-icons/all-files/fi/FiEdit3';
import { FiMoreVertical } from '@react-icons/all-files/fi/FiMoreVertical';
import styles from './index.module.scss';
import { Permissions } from '@linen/types';

interface Props {
  permissions: Permissions;
  page: number;
  total: number;
  onAddClick(): void;
  onPageChange(type: string): void;
  dropdown: DropdownItem[];
}

export default function Header({
  permissions,
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
          {/* <StickyHeader.Subtitle>
            All of your channel conversations in one place
          </StickyHeader.Subtitle> */}
        </div>
        <div className={styles.right}>
          {permissions.chat && (
            <Icon onClick={onAddClick}>
              <FiEdit3 />
            </Icon>
          )}
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
