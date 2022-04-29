import React from 'react';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import serializeAccount, {
  SerializedAccount,
} from '../../../serializers/account';
import { findAccountByEmail } from '../../../lib/models';
import { CheckIcon } from '@heroicons/react/outline';

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
    description: 'Additional features',
    includedFeatures: [
      'Potenti felis, in cras at at ligula nunc. ',
      'Orci neque eget pellentesque.',
      'Donec mauris sit in eu tincidunt etiam.',
    ],
  },
];

export default function SettingsPage({ account }: Props) {
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
            <div className="relative self-center mt-6 bg-gray-100 rounded-lg p-0.5 flex sm:mt-8">
              <button
                type="button"
                className="relative w-1/2 bg-white border-gray-200 rounded-md shadow-sm py-2 text-sm font-medium text-gray-900 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8"
              >
                Monthly billing
              </button>
              <button
                type="button"
                className="ml-0.5 relative w-1/2 border border-transparent rounded-md py-2 text-sm font-medium text-gray-700 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8"
              >
                Yearly billing
              </button>
            </div>
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
                    {tier.priceMonthly ? (
                      <>
                        <span className="text-4xl font-extrabold text-gray-900">
                          ${tier.priceMonthly}
                        </span>{' '}
                        <span className="text-base font-medium text-gray-500">
                          /mo
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-extrabold text-gray-900">
                        Free
                      </span>
                    )}
                  </p>
                  {tier.priceMonthly ? (
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
