import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import InboxView from '@linen/ui/InboxView';
import { useUsersContext } from '@linen/contexts/Users';
import { qs } from '@linen/utilities/url';
import { InboxProps } from '@linen/types';
import { useLinenStore } from '../store';
import Loading from '../components/Loading';
import { api } from '../fetcher';
import { mockedComponent, mockedContext, mockedFunction } from '../mock';

type InboxPageProps = {
  communityName: string;
};

export default function InboxPage() {
  const { communityName } = useParams() as InboxPageProps;
  const setInboxProps = useLinenStore((state) => state.setInboxProps);
  const { isLoading, error } = useQuery({
    queryKey: ['inbox', { communityName }],
    queryFn: () =>
      api
        .get<InboxProps>(`/api/ssr/commons/inbox?${qs({ communityName })}`)
        .then((data) => {
          setInboxProps(data, communityName);
          return data;
        }),
    enabled: !!communityName,
    retry: false,
    refetchOnWindowFocus: false,
  });
  if (!communityName) return <Loading />;
  if (isLoading) return <Loading />;
  if (error) return <>An error has occurred: {JSON.stringify(error)}</>;
  return <View />;
}

function View() {
  const inboxProps = useLinenStore((state) => state.inboxProps);

  if (!inboxProps) return <Loading />;

  return (
    <InboxView
      {...{
        ...inboxProps,
        useUsersContext,
        api,
        // TODO:
        Actions: mockedComponent,
        JoinChannelLink: mockedComponent,
        useJoinContext: mockedContext,
        addReactionToThread: mockedFunction,
      }}
    />
  );
}
