import React from 'react';
import Dropdown from '@/Dropdown';
import Icon from '@/Icon';
import StickyHeader from '@/StickyHeader';
import styles from './index.module.scss';
import { SerializedUser } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiMoreVertical } from '@react-icons/all-files/fi/FiMoreVertical';
import { BsFillGearFill } from '@react-icons/all-files/bs/BsFillGearFill';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiEdit3 } from '@react-icons/all-files/fi/FiEdit3';
import { Permissions, SerializedChannel } from '@linen/types';

interface Props {
  className?: string;
  channel: SerializedChannel;
  children: React.ReactNode;
  currentUser?: SerializedUser;
  permissions: Permissions;
  onAddClick(): void;
  handleOpenIntegrations(): void;
  handleOpenMembers(): void;
  ShowIntegrationDetail(): JSX.Element;
}

export default function Header({
  className,
  channel,
  children,
  currentUser,
  permissions,
  onAddClick,
  handleOpenIntegrations,
  handleOpenMembers,
  ShowIntegrationDetail,
}: Props) {
  const items = [];
  if (channel.type !== 'DM') {
    items.push({
      icon: <BsFillGearFill />,
      label: 'Integrations',
      onClick: handleOpenIntegrations,
    });
  }
  if (channel.type === 'PRIVATE') {
    items.push({
      icon: <FiUsers />,
      label: 'Members',
      onClick: handleOpenMembers,
    });
  }
  return (
    <StickyHeader id="chat-layout-header" className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channel.channelName}
          <ShowIntegrationDetail />
        </div>
        {}
        {currentUser && (
          <div className={styles.actions}>
            {permissions.chat && (
              <Icon onClick={onAddClick}>
                <FiEdit3 />
              </Icon>
            )}
            {items.length > 0 && (
              <Dropdown
                button={
                  <Icon>
                    <FiMoreVertical />
                  </Icon>
                }
                items={items}
              />
            )}
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
