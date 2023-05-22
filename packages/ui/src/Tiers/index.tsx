import React from 'react';
import classNames from 'classnames';
import { SerializedAccount, Period } from '@linen/types';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import Card from './Card';
import styles from './index.module.scss';

interface Tier {
  id: string;
  name: string;
  description: string;
  href: string;
  features: string[];
  priceId: string;
  price: string;
  active?: boolean;
}

interface Props {
  tiers: Tier[];
  activePeriod: Period;
  currentCommunity: SerializedAccount;
}

const ENTERPRISE_PLAN = {
  name: 'Community',
  description: 'Dedicated support and infrastructure for your community.',
  features: [
    'Unlimited members',
    'Custom domain',
    'Custom branding',
    'SEO benefits',
    'Private communities',
    'Analytics',
    'Priority Support',
  ],
  price: 'Custom',
};

export default function Tiers({
  currentCommunity,
  tiers,
  activePeriod,
}: Props) {
  return (
    <div className={styles.grid}>
      {tiers.map((tier) => {
        const active = tier.name === 'Vici';
        return (
          <Card
            key={tier.name}
            title={tier.name}
            description={tier.description}
            price={tier.price}
            period={activePeriod}
            active={active}
          >
            <form method="POST" action="/api/plans">
              <input
                type="hidden"
                name="communityId"
                value={currentCommunity.id}
              />
              <input type="hidden" name="priceId" value={tier.priceId} />
              <input
                type="hidden"
                name="successUrl"
                value={window && window.location.href}
              />
              <input
                type="hidden"
                name="cancelUrl"
                value={window && window.location.href}
              />
              <button
                type="submit"
                className={classNames(styles.button, {
                  [styles.active]: active,
                })}
              >
                {active && <FiZap />}
                Buy plan
              </button>
            </form>
            <div>
              <ul className={styles.list}>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <FiCheck />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        );
      })}
      <Card
        title={ENTERPRISE_PLAN.name}
        description={ENTERPRISE_PLAN.description}
        price="Custom"
      >
        <a
          href="mailto:support@linen.dev?subject=Linen Enterprise"
          className={styles.button}
        >
          Contact us
        </a>
        <div>
          <ul className={styles.list}>
            {ENTERPRISE_PLAN.features.map((feature) => (
              <li key={feature}>
                <FiCheck />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
