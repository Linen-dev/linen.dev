import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StarredView from '@linen/ui/StarredView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { mockedComponent, mockedFunction } from '@/mock';

type StarredPageProps = {
  communityName: string;
};

export default function StarredPage() {
  const { communityName } = useParams() as StarredPageProps;
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

  if (!inboxProps) return <Loading />;

  return (
    <StarredView
      currentCommunity={inboxProps.currentCommunity}
      isSubDomainRouting={inboxProps.isSubDomainRouting}
      permissions={inboxProps.permissions}
      settings={inboxProps.settings}
      api={api}
      // TODO:
      JoinChannelLink={mockedComponent}
      addReactionToThread={mockedFunction}
    />
  );
}
