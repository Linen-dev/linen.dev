import React, { useState } from 'react';
import { NextPageContext } from 'next';
import Session from 'services/session';
import DashboardLayout from 'components/layout/DashboardLayout';
import serializeAccount from 'serializers/account';
import { findAccountAndUserByEmail } from 'lib/models';
import Tiers from 'components/Pages/Tiers';
import { SerializedAccount, Roles } from '@linen/types';

interface Props {
  account?: SerializedAccount;
}

export enum Period {
  Monthly,
  Yearly,
}

export default function PlansPage({ account }: Props) {
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
    <DashboardLayout account={account}>
      <div className="mx-auto">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">
            Pricing Plans
          </h1>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start using for free.
            <br />
            Paid plans unlock additional features.
          </p>
        </div>
        <Tiers activePeriod={Period.Monthly} tiers={tiers} account={account} />
      </div>
    </DashboardLayout>
  );
}

export async function getServerSideProps({ req, res }: NextPageContext) {
  const session = await Session.find(req as any, res as any);
  const accountAndUser = await findAccountAndUserByEmail(session?.user?.email);
  const { account, user } = accountAndUser || {};

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination:
          '../signin?' +
          new URLSearchParams({ callbackUrl: '/settings/plans' }),
      },
    };
  }

  if (user && user.role === Roles.MEMBER) {
    return {
      redirect: {
        permanent: false,
        destination: '../settings?forbidden=1',
      },
    };
  }

  if (!account) {
    return {
      props: {
        session,
        account: null,
      },
    };
  }

  return {
    props: {
      session,
      account: serializeAccount(account),
    },
  };
}
