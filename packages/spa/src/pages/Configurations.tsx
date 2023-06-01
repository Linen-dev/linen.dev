import { useParams } from 'react-router-dom';
import ConfigurationsView from '@linen/ui/ConfigurationsView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { mockAccount } from '@/mocks';

type ConfigurationsPageProps = {
  communityName: string;
};

export default function ConfigurationsPage() {
  const { communityName } = useParams() as ConfigurationsPageProps;
  const { inboxProps, setChannels } = useLinenStore((state) => ({
    inboxProps: state.inboxProps,
    setChannels: state.setChannels,
  }));

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/configurations`);
  }, [communityName]);

  return (
    <ConfigurationsView
      channels={inboxProps?.channels || []}
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      api={api}
      setChannels={setChannels}
    />
  );
}
