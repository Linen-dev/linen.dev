import React, { useState } from 'react';
import { NextPageContext } from 'next';
import stripe from 'services/stripe';
import { StripePricesResponse, StripePrice } from 'services/stripe/types';
import { getSession } from 'next-auth/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import serializeAccount, {
  SerializedAccount,
} from '../../../serializers/account';
import { findAccountByEmail } from '../../../lib/models';
import Billing from 'components/Pages/Billing';
import Tiers from 'components/Pages/Tiers';
import { isStripeEnabled } from 'utilities/featureFlags';

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
              type: Period.Monthly,
            },
            {
              type: Period.Yearly,
            },
          ],
        },
      ];

      return (
        <DashboardLayout>
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

    return (
      <DashboardLayout header="Plans">
        <h1>You are not signed in.</h1>
      </DashboardLayout>
    );
  }

  if (!prices) {
    return (
      <DashboardLayout header="Plans">
        <p>
          Stripe is unavailable and we're not able to fetch plans right now.
          Please try again later.
        </p>
      </DashboardLayout>
    );
  }

  if (prices.length === 0) {
    return (
      <DashboardLayout header="Plans">
        <p>
          Sorry, we didn't set up any plans in Stripe yet. Please check again
          later.
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
      <DashboardLayout>
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
    <DashboardLayout header="Plans">
      <h1>You are not signed in.</h1>
    </DashboardLayout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: 'signin',
      },
    };
  }
  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: '../settings',
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

  return {
    props: {
      session,
      account: serializeAccount(account),
      prices,
    },
  };
}
