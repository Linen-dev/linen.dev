import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AllView from '@linen/ui/AllView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { mockedFunction } from '@/mock';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';

type AllPageProps = {
  communityName: string;
};

export default function AllPage() {
  const { communityName } = useParams() as AllPageProps;
  const setInboxProps = useLinenStore((state) => state.setInboxProps);
  const { isLoading, error } = useQuery({
    queryKey: ['inbox', { communityName }],
    queryFn: () =>
      api.getInboxProps({ communityName }).then((data) => {
        setInboxProps(data, communityName);
        return data;
      }),
    enabled: !!communityName,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/all`);
  }, [communityName]);

  if (!communityName || isLoading) {
    return <Loading />;
  }
  if (error) {
    return <>An error has occurred: {JSON.stringify(error)}</>;
  }
  return <View />;
}

function View() {
  const inboxProps = useLinenStore((state) => state.inboxProps);

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <AllView
      currentCommunity={inboxProps.currentCommunity}
      isSubDomainRouting={inboxProps.isSubDomainRouting}
      permissions={inboxProps.permissions}
      settings={inboxProps.settings}
      api={api}
      // TODO:
      addReactionToThread={mockedFunction}
    />
  );
}
