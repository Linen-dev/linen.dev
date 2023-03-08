import React from 'react';
import { Dropdown, StickyHeader } from '@linen/ui';
import styles from './index.module.css';
import { SerializedUser } from '@linen/types';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiMoreVertical } from '@react-icons/all-files/fi/FiMoreVertical';
import Icon from './Icon';
import { BsFillGearFill } from '@react-icons/all-files/bs/BsFillGearFill';
import { ShowIntegrationDetail } from 'components/Modals/IntegrationsModal';

interface Props {
  className?: string;
  channelName: string;
  children: React.ReactNode;
  currentUser?: SerializedUser;
  handleOpenIntegrations(): void;
}

export default function Header({
  className,
  channelName,
  children,
  currentUser,
  handleOpenIntegrations,
}: Props) {
  return (
    <StickyHeader className={className}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FiHash /> {channelName}
          <ShowIntegrationDetail />
        </div>
        {currentUser && (
          <div className={styles.actions}>
            <Dropdown
              button={
                <Icon>
                  <FiMoreVertical />
                </Icon>
              }
              items={[
                {
                  icon: <BsFillGearFill />,
                  label: 'Integrations',
                  onClick: handleOpenIntegrations,
                },
              ]}
            />
          </div>
        )}
      </div>
      {children}
    </StickyHeader>
  );
}
