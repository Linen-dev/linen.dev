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
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/plans?period=monthly', {
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
  }, []);

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
        <div>
          <h1 className={styles.header}>
            <span>
              <FiZap />
              Thank you!
            </span>
          </h1>
          <p className={styles.description}>
            Your subscription is currently active and you&apos;re on a premium
            plan.
          </p>
        </div>
      ) : (
        <div>
          <h1 className={styles.header}>
            <span>
              <FiZap />
              Upgrade
            </span>
          </h1>
          <p className={styles.description}>
            Choose an affordable plan that matches your community size and
            unlock additional features of the platform.
          </p>
          {loading ? (
            <Spinner className={styles.loader} />
          ) : (
            <Tiers
              activePeriod={Period.Monthly}
              tiers={tiers}
              currentCommunity={currentCommunity}
            />
          )}
        </div>
      )}
    </PageLayout>
  );
}
