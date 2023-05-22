import React, { useEffect, useState } from 'react';
import Tiers from '@/Tiers';
import { SerializedAccount, Period } from '@linen/types';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import styles from './index.module.scss';
import Spinner from '@/Spinner';
import Toggle from '@/Toggle';
import ActivePlan from './ActivePlan';
import type { ApiClient } from '@linen/api-client';

export default function PlansView({
  currentCommunity,
  api,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}) {
  const [period, setPeriod] = useState(Period.Monthly);
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getPlans({ period })
      .then((data) => {
        if (mounted && data && data.plans) {
          setTiers(data.plans);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [period]);

  return (
    <>
      {currentCommunity.premium ? (
        <ActivePlan currentCommunity={currentCommunity} api={api} />
      ) : (
        <div>
          <h1 className={styles.header}>
            <span className={styles.underline}>
              <FiZap />
              Upgrade
            </span>
          </h1>
          <p className={styles.description}>
            Choose an affordable plan that matches your community size and
            unlock additional features of the platform.{' '}
            <span className={styles.underline}>7-day free trial.</span>
          </p>
          <div className={styles.period}>
            <span>monthly</span>
            <Toggle
              checked={period === Period.Yearly}
              onChange={(checked) => {
                setLoading(true);
                setPeriod(checked ? Period.Yearly : Period.Monthly);
              }}
            />
            <span>yearly</span>
          </div>

          {loading ? (
            <Spinner className={styles.loader} />
          ) : (
            <Tiers
              activePeriod={period}
              tiers={tiers}
              currentCommunity={currentCommunity}
            />
          )}
        </div>
      )}
    </>
  );
}
