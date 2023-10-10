import { useParams } from 'react-router-dom';
import PlansView from '@linen/ui/PlansView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { mockAccount } from '@/mocks';

type PlansPageProps = {
  communityName: string;
};

export default function PlansPage() {
  const { communityName } = useParams() as PlansPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/plans`);
  }, [communityName]);

  return (
    <PlansView
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      api={api}
    />
  );
}
