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
import { Period } from './types';

interface Props {
  account?: SerializedAccount;
}

const tiers = [
  {
    name: 'Standard',
    href: '#',
    description: 'All the basics for starting',
    includedFeatures: [
      'Potenti felis, in cras at at ligula nunc.',
      'Orci neque eget pellentesque.',
    ],
  },
  {
    name: 'Premium',
    href: '#',
    priceMonthly: 250,
    priceYearly: 2500,
    description: 'Additional features',
    includedFeatures: [
      'Potenti felis, in cras at at ligula nunc. ',
      'Orci neque eget pellentesque.',
      'Donec mauris sit in eu tincidunt etiam.',
    ],
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
          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200"
              >
                <div className="p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">
                    {tier.name}
                  </h2>
                  <p className="mt-4 text-sm text-gray-500">
                    {tier.description}
                  </p>
                  <p className="mt-8">
                    {tier.priceMonthly && tier.priceYearly ? (
                      <>
                        <span className="text-4xl font-extrabold text-gray-900">
                          $
                          {period === Period.Monthly
                            ? tier.priceMonthly
                            : tier.priceYearly}
                        </span>{' '}
                        <span className="text-base font-medium text-gray-500">
                          /{period === Period.Monthly ? 'mo' : 'yr'}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-extrabold text-gray-900">
                        Free
                      </span>
                    )}
                  </p>
                  {tier.priceMonthly && tier.priceYearly ? (
                    <a
                      href={tier.href}
                      className="mt-8 block w-full bg-blue-500 border border-blue-500 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-600"
                    >
                      Buy {tier.name}
                    </a>
                  ) : (
                    <a className="mt-8 block w-full bg-green-500 border border-green-500 rounded-md py-2 text-sm font-semibold text-white text-center">
                      <CheckIcon className="inline-block h-6 w-5 ml-1" />
                    </a>
                  )}
                </div>
                <div className="pt-6 pb-8 px-6">
                  <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                    What's included
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {tier.includedFeatures.map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <CheckIcon
                          className="flex-shrink-0 h-5 w-5 text-green-500"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
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
