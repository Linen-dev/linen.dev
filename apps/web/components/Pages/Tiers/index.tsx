import React from 'react';
import classNames from 'classnames';
import { Period } from 'components/Pages/Plans';
import { SerializedAccount } from '@linen/types';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import Card from './Card';
import styles from './index.module.scss';

interface Tier {
  name: string;
  description: string;
  href: string;
  features: string[];
  prices: { [key: string]: number };
  active?: boolean;
}

interface Props {
  tiers: Tier[];
  activePeriod: Period;
  account?: SerializedAccount;
}

export default function Tiers({ tiers, activePeriod, account }: Props) {
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          title={tier.name}
          description={tier.description}
          price={tier.prices[activePeriod]}
          period={activePeriod}
          active={tier.active}
        >
          <div>
            {!account && tier.prices ? (
              <a
                className="shadow-sm mt-8 block w-full bg-indigo-500 border border-indigo-500 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-600"
                href="mailto:help@linen.dev?subject=Linen%20Premium"
              >
                Contact Us
              </a>
            ) : !!account && !account.premium && tier.prices ? (
              <a
                className="shadow-sm mt-8 block w-full bg-indigo-500 border border-indigo-500 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-600"
                href="mailto:help@linen.dev?subject=Linen%20Premium"
              >
                Contact Us
              </a>
            ) : (
              <a
                className={classNames(styles.button, {
                  [styles.active]: tier.active,
                })}
              >
                {tier.active && <FiZap />}
                Buy plan
              </a>
            )}
          </div>
          <div>
            <ul className={styles.list}>
              {tier.features.map((feature) => (
                <li>
                  <FiCheck />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ))}
    </div>
  );
}
