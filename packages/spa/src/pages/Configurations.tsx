import { useParams } from 'react-router-dom';
import ConfigurationsView from '@linen/ui/ConfigurationsView';
import { shallow, useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { mockAccount } from '@/mocks';

type ConfigurationsPageProps = {
  communityName: string;
};

export default function ConfigurationsPage() {
  const { communityName } = useParams() as ConfigurationsPageProps;
  const { inboxProps, setChannels, channels } = useLinenStore(
    (state) => ({
      inboxProps: state.inboxProps,
      setChannels: state.setChannels,
      channels: state.channels,
    }),
    shallow
  );

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/configurations`);
  }, [communityName]);

  return (
    <ConfigurationsView
      channels={channels}
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      api={api}
      setChannels={setChannels}
    />
  );
}
