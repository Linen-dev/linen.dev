import { useParams } from 'react-router-dom';
import PlansView from '@linen/ui/PlansView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';

type PlansPageProps = {
  communityName: string;
};

export default function PlansPage() {
  const { communityName } = useParams() as PlansPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/plans`);
  }, [communityName]);

  if (!inboxProps) {
    return <Loading />;
  }

  return <PlansView currentCommunity={inboxProps.currentCommunity} api={api} />;
}
