import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import Tiers from 'components/Pages/Tiers';
import {
  SerializedAccount,
  SerializedChannel,
  Permissions,
  Settings,
} from '@linen/types';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import styles from './index.module.scss';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export enum Period {
  Monthly,
  Yearly,
}

export default function PlansPage({
  channels,
  communities,
  permissions,
  settings,
  currentCommunity,
  isSubDomainRouting,
  dms,
}: Props) {
  const tiers = [
    {
      name: 'Veni',
      href: '#',
      description:
        'The essentials to see Linen on your own domain with custom branding.',
      features: [
        'Up to 10,000 members',
        'Custom domain',
        'Custom branding',
        'SEO benefits',
        'Private communities',
        'Analytics',
        'Support',
      ],
      prices: { [Period.Monthly]: 200, [Period.Yearly]: 2000 },
    },
    {
      name: 'Vidi',
      href: '#',
      description:
        'The essentials to see Linen on your own domain with custom branding.',
      features: [
        'Up to 15,000 members',
        'Custom domain',
        'Custom branding',
        'SEO benefits',
        'Private communities',
        'Analytics',
        'Support',
      ],
      prices: { [Period.Monthly]: 250, [Period.Yearly]: 2500 },
    },
    {
      name: 'Vici',
      href: '#',
      description:
        'Recommended plan that supports the ongoing growth of the platform.',
      features: [
        'Up to 20,000 members',
        'Custom domain',
        'Custom branding',
        'SEO benefits',
        'Private communities',
        'Analytics',
        'Priority support',
      ],
      prices: { [Period.Monthly]: 300, [Period.Yearly]: 3000 },
      active: true,
    },
    {
      name: 'Enterprise',
      href: '#',
      description: 'Dedicated support and infrastructure for your community.',
      features: [
        'Unlimited members',
        'Custom domain',
        'Custom branding',
        'SEO benefits',
        'Private communities',
        'Analytics',
        'Priority support',
      ],
      prices: { [Period.Monthly]: 'Custom', [Period.Yearly]: 'Custom' },
    },
  ];

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      permissions={permissions}
      isSubDomainRouting={isSubDomainRouting}
      dms={dms}
    >
      <div>
        <h1 className={styles.header}>
          <span>
            <FiZap />
            Upgrade
          </span>
        </h1>
        <p className={styles.description}>
          Choose an affordable plan that matches your community size and unlock
          additional features of the platform.
        </p>
        <Tiers
          activePeriod={Period.Monthly}
          tiers={tiers}
          account={currentCommunity}
        />
      </div>
    </PageLayout>
  );
}
