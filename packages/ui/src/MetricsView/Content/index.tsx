import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';

interface Metrics {
  members: number;
}

interface Props {
  communityId: string;
  api: ApiClient;
}

export default function Content({ communityId, api }: Props) {
  const [metrics, setMetrics] = useState<Metrics>();
  useEffect(() => {
    let mounted = true;
    api
      .getMetrics({
        communityId,
      })
      .then((data) => {
        setTimeout(() => {
          if (mounted) {
            setMetrics(data);
          }
        }, 250);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      <dl className={styles.grid}>
        <div className={styles.card}>
          <dt className={styles.cardDescription}>Total Members</dt>
          <dd className={styles.cardValue}>
            {metrics ? metrics.members : <span>...</span>}
          </dd>
        </div>
      </dl>
    </div>
  );
}
