import React, { useState } from 'react';
import { NextPageContext } from 'next';
import classNames from 'classnames';
import { getSession } from 'next-auth/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import serializeAccount, {
  SerializedAccount,
} from '../../../serializers/account';
import { findAccountByEmail } from '../../../lib/models';
import { CheckIcon } from '@heroicons/react/outline';
import Billing from './Billing';
import Tiers from './Tiers';
import { Period } from './types';

interface Props {
  account?: SerializedAccount;
}

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
    priceMonthly: 250,
    priceYearly: 2500,
    description: 'Additional features',
    features: ['Use your own domain', 'Use your own Google Analytics'],
  },
];

export default function SettingsPage({ account }: Props) {
  const [period, setPeriod] = useState(Period.Monthly);
  if (account) {
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
          <Tiers activePeriod={period} tiers={tiers} />
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

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: 'signup/CreateAccountForm',
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
