import React, { useEffect, useState } from 'react';
import { api } from 'utilities/requests';
import styles from './index.module.scss';
import { qs } from '@linen/utilities/url';

interface Metrics {
  members: number;
}

interface Props {
  communityId: string;
}

export default function Content({ communityId }: Props) {
  const [metrics, setMetrics] = useState<Metrics>();
  useEffect(() => {
    let mounted = true;
    api
      .get(
        `/api/metrics?${qs({
          communityId,
        })}`
      )
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
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow border border-2 sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-500">
            Total Members
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 h-10">
            {metrics ? metrics.members : <span>...</span>}
          </dd>
        </div>
      </dl>
    </div>
  );
}
