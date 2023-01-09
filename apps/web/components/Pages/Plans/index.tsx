import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import Tiers from 'components/Pages/Tiers';
import { SerializedAccount, SerializedChannel, Permissions, Settings } from '@linen/types';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean
}

export enum Period {
  Monthly,
  Yearly,
}

export default function PlansPage({ channels, permissions, settings, currentCommunity, isSubDomainRouting }: Props) {
  const tiers = [
    {
      name: 'Free edition',
      href: '#',
      description: 'Great for non profits and open source communities',
      features: [
        'Hosting on Linen.dev domain',
        'Sync Discord or Slack community',
        'Anonymize community members',
        'Unlimited message retention history',
        'Show or hide channels',
        'Custom community invite URL',
      ],
    },
    {
      name: 'Business',
      href: '#',
      description: '1,000+ members',
      features: [
        'Custom domain',
        'Generate SEO from organic content',
        'Google analytics support',
        'Custom logo',
        'Custom brand colors',
        'Generated sitemap to improve SEO',
        'Private communities',
      ],
      prices: [
        {
          type: Period.Monthly,
          price: 100,
        },
        {
          type: Period.Yearly,
          price: 1000,
        },
      ],
    },
  ];

  return (
    <PageLayout
      channels={channels}
      settings={settings}
      permissions={permissions}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="mx-auto">
        <div className="sm:flex sm:flex-col sm:align-center pt-12">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">
            Pricing Plans
          </h1>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start using for free.
            <br />
            Paid plans unlock additional features.
          </p>
        </div>
        <Tiers activePeriod={Period.Monthly} tiers={tiers} account={currentCommunity} />
      </div>
    </PageLayout>
  );
}
