import React from 'react';
import { Period } from 'pages/settings/plans';
import { SerializedAccount } from '@linen/types';
import { isStripeEnabled } from 'utilities/featureFlags';
import { GoCheck } from 'react-icons/go';

interface Price {
  id?: string;
  amount?: number;
  type: Period;
}

interface Tier {
  name: string;
  description: string;
  href: string;
  features: string[];
  prices?: Price[];
}

interface Props {
  tiers: Tier[];
  activePeriod: Period;
  account?: SerializedAccount;
}

export default function Tiers({ tiers, activePeriod, account }: Props) {
  return (
    <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className="border-solid border-1 border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-200"
        >
          <div className="p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              {tier.name}
            </h2>
            <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
            <p className="mt-8">
              {isStripeEnabled &&
                (tier.prices ? (
                  <>
                    <span className="text-4xl font-extrabold text-gray-900">
                      $
                      {activePeriod === Period.Monthly
                        ? tier.prices[0].amount
                        : tier.prices[1].amount}
                    </span>{' '}
                    <span className="text-base font-medium text-gray-500">
                      /{activePeriod === Period.Monthly ? 'mo' : 'yr'}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-extrabold text-gray-900">
                    Free
                  </span>
                ))}
            </p>

            {!account && tier.prices ? (
              <a
                className="shadow-sm mt-8 block w-full bg-blue-500 border border-blue-500 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-600"
                href="mailto:help@linen.dev?subject=Linen%20Premium"
              >
                Contact Us
              </a>
            ) : !!account && !account.premium && tier.prices ? (
              isStripeEnabled ? (
                <button
                  onClick={async () => {
                    if (!tier.prices) {
                      return;
                    }
                    const response = await fetch('/api/checkout', {
                      method: 'POST',
                      body: JSON.stringify({
                        accountId: account.id,
                        priceId:
                          activePeriod === Period.Monthly
                            ? tier?.prices[0].id
                            : tier.prices[1].id,
                      }),
                    });
                    const { redirectUrl } = await response.json();
                    window.location = redirectUrl;
                  }}
                  type="submit"
                  className="shadow-sm mt-8 block w-full bg-blue-500 border border-blue-500 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-600"
                >
                  Buy {tier.name}
                </button>
              ) : (
                <a
                  className="shadow-sm mt-8 block w-full bg-blue-500 border border-blue-500 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-600"
                  href="mailto:help@linen.dev?subject=Linen%20Premium"
                >
                  Contact Us
                </a>
              )
            ) : (
              <a className="shadow-sm mt-8 block w-full bg-green-500 border border-green-500 rounded-md py-2 text-sm font-semibold text-white text-center">
                <GoCheck className="inline-block h-4 ml-1" />
              </a>
            )}
          </div>
          <div className="pt-6 pb-8 px-6">
            <h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
              What&apos;s included
            </h3>
            <ul role="list" className="mt-6 space-y-4">
              {tier.features.map((feature) => (
                <li key={feature} className="flex space-x-3">
                  <GoCheck
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
  );
}
