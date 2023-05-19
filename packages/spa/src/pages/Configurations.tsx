import { useParams } from 'react-router-dom';
import ConfigurationsView from '@linen/ui/ConfigurationsView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';

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

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <ConfigurationsView
      channels={inboxProps.channels}
      currentCommunity={inboxProps.currentCommunity}
      api={api}
      setChannels={setChannels}
    />
  );
}
