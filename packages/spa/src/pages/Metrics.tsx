import { useParams } from 'react-router-dom';
import MetricsView from '@linen/ui/MetricsView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';

type MetricsPageProps = {
  communityName: string;
};

export default function MetricsPage() {
  const { communityName } = useParams() as MetricsPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/metrics`);
  }, [communityName]);

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <MetricsView currentCommunity={inboxProps.currentCommunity} api={api} />
  );
}
