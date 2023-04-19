import React, { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import Tiers from 'components/Pages/Tiers';
import {
  SerializedAccount,
  SerializedChannel,
  Permissions,
  Settings,
} from '@linen/types';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import styles from './index.module.scss';
import Spinner from '@linen/ui/Spinner';
import Toggle from '@linen/ui/Toggle';
import ActivePlan from './ActivePlan';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export enum Period {
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export default function PlansPage({
  channels,
  communities,
  permissions,
  settings,
  currentCommunity,
  isSubDomainRouting,
  dms,
}: Props) {
  const [period, setPeriod] = useState(Period.Monthly);
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/plans?period=${period}`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
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
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      permissions={permissions}
      isSubDomainRouting={isSubDomainRouting}
      dms={dms}
    >
      {currentCommunity.premium ? (
        <ActivePlan currentCommunity={currentCommunity} />
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
    </PageLayout>
  );
}
