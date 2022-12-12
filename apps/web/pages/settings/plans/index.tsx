import React, { useState } from 'react';
import { NextPageContext } from 'next';
import stripe from 'services/stripe';
import { StripePricesResponse, StripePrice } from 'services/stripe/types';
import Session from 'services/session';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import serializeAccount from '../../../serializers/account';
import { findAccountAndUserByEmail } from '../../../lib/models';
import Billing from 'components/Pages/Billing';
import Tiers from 'components/Pages/Tiers';
import { isStripeEnabled } from 'utilities/featureFlags';
import { SerializedAccount, Roles } from '@linen/types';

interface Props {
  account?: SerializedAccount;
  prices?: StripePrice[];
}

export enum Period {
  Monthly,
  Yearly,
}

export default function SettingsPage({ account, prices }: Props) {
  const [period, setPeriod] = useState(Period.Monthly);

  if (!isStripeEnabled) {
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
          <Tiers activePeriod={period} tiers={tiers} account={account} />
        </div>
      </DashboardLayout>
    );
  }

  if (!prices) {
    return (
      <DashboardLayout header="Plans" account={account}>
        <p>
          Stripe is unavailable and we&apos;re not able to fetch plans right
          now. Please try again later.
        </p>
      </DashboardLayout>
    );
  }

  if (prices.length === 0) {
    return (
      <DashboardLayout header="Plans" account={account}>
        <p>
          Sorry, we didn&apos;t set up any plans in Stripe yet. Please check
          again later.
        </p>
      </DashboardLayout>
    );
  }

  if (account) {
    const tiers = [
      {
        name: 'Standard',
        href: '#',
        description: 'All the basics for starting',
        features: ['SEO friendly content'],
      },
      {
        name: 'Premium',
        href: '#',
        description: 'Additional features',
        features: ['Use your own domain', 'Use your own Google Analytics'],
        prices: [
          {
            id: prices[0].id,
            amount: prices[0].unit_amount / 100,
            type: Period.Monthly,
          },
          {
            id: prices[1].id,
            amount: prices[1].unit_amount / 100,
            type: Period.Yearly,
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
            <Billing
              activePeriod={period}
              plans={[
                {
                  name: 'Monthly',
                  type: Period.Monthly,
                },
                {
                  name: 'Yearly',
                  type: Period.Yearly,
                },
              ]}
              onPeriodChange={(type) => setPeriod(type)}
            />
          </div>
          <Tiers activePeriod={period} tiers={tiers} account={account} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout header="Plans" account={account}>
      <h1>You are not signed in.</h1>
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

  let prices;
  try {
    if (isStripeEnabled) {
      const response = (await stripe.prices.list()) as StripePricesResponse;
      prices = response.data;
    } else {
      prices = null;
    }
  } catch (exception) {
    prices = null;
  }

  if (!account) {
    return {
      props: {
        session,
        account: null,
        prices,
      },
    };
  }

  return {
    props: {
      session,
      account: serializeAccount(account),
      prices,
    },
  };
}
