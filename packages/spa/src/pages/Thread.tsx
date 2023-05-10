import { useParams } from 'react-router-dom';
import ThreadView from '@linen/ui/ThreadView';
import { useUsersContext } from '@linen/contexts/Users';
import { qs } from '@linen/utilities/url';
import { useLinenStore } from '../store';
import Loading from '../components/Loading';
import { api } from '../fetcher';
import { mockedComponent, mockedContext } from '../mock';
import { useQuery } from '@tanstack/react-query';
import { ThreadProps } from '@linen/types';

type ThreadPageProps = {
  communityName: string;
  threadId: string;
  slug?: string;
};

export default function ThreadPage() {
  const { communityName, threadId, slug } = useParams() as ThreadPageProps;
  const setThreadsProps = useLinenStore((state) => state.setThreadsProps);
  const { isLoading, error } = useQuery({
    queryKey: ['threads', { communityName, threadId, slug }],
    queryFn: () =>
      api
        .get<ThreadProps>(
          `/api/ssr/threads?${qs({ communityName, threadId, slug })}`
        )
        .then((data) => {
          setThreadsProps(data, communityName);
          return data;
        }),
    enabled: !!communityName && !!threadId,
    retry: false,
  });

  if (!communityName && !threadId) return <Loading />;
  if (isLoading) return <Loading />;
  if (error) return <>An error has occurred: {JSON.stringify(error)}</>;
  return <View />;
}

function View() {
  const threadProps = useLinenStore((state) => state.threadProps);
  const currentCommunity = useLinenStore((state) => state.currentCommunity);
  const permissions = useLinenStore((state) => state.permissions);
  const settings = useLinenStore((state) => state.settings);

  if (!threadProps) return <Loading />;
  if (!currentCommunity) return <Loading />;
  if (!permissions) return <Loading />;
  if (!settings) return <Loading />;

  return (
    <ThreadView
      currentChannel={threadProps.currentChannel}
      isSubDomainRouting={threadProps.isSubDomainRouting}
      thread={threadProps.thread}
      threadUrl={threadProps.threadUrl}
      isBot={threadProps.isBot}
      currentCommunity={currentCommunity}
      permissions={permissions}
      settings={settings}
      api={api}
      useUsersContext={useUsersContext}
      // TODO:
      JoinChannelLink={mockedComponent}
      useJoinContext={mockedContext}
    />
  );
}
