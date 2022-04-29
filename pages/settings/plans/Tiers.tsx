import React from 'react';
import { Period } from './types';
import { CheckIcon } from '@heroicons/react/outline';

interface Tier {
  name: string;
  description: string;
  href: string;
  priceMonthly?: number;
  priceYearly?: number;
  features: string[];
}

interface Props {
  tiers: Tier[];
  activePeriod: Period;
}

export default function Tiers({ tiers, activePeriod }: Props) {
  return (
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
            <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
            <p className="mt-8">
              {tier.priceMonthly && tier.priceYearly ? (
                <>
                  <span className="text-4xl font-extrabold text-gray-900">
                    $
                    {activePeriod === Period.Monthly
                      ? tier.priceMonthly
                      : tier.priceYearly}
                  </span>{' '}
                  <span className="text-base font-medium text-gray-500">
                    /{activePeriod === Period.Monthly ? 'mo' : 'yr'}
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
              {tier.features.map((feature) => (
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
  );
}
