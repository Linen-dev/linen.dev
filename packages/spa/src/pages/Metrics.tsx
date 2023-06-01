import { useParams } from 'react-router-dom';
import MetricsView from '@linen/ui/MetricsView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { mockAccount } from '@/mocks';

type MetricsPageProps = {
  communityName: string;
};

export default function MetricsPage() {
  const { communityName } = useParams() as MetricsPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/metrics`);
  }, [communityName]);

  return (
    <MetricsView
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      api={api}
    />
  );
}
