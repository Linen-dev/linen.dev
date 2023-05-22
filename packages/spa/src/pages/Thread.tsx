import { useParams } from 'react-router-dom';
import ThreadView from '@linen/ui/ThreadView';
import { useUsersContext } from '@linen/contexts/Users';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useQuery } from '@tanstack/react-query';
import { localStorage } from '@linen/utilities/storage';
import { useEffect } from 'react';

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
      api.getThreadProps({ communityName, threadId, slug }).then((data) => {
        setThreadsProps(data, communityName);
        return data;
      }),
    enabled: !!communityName && !!threadId,
    retry: false,
  });

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/t/${threadId}/${slug}`);
  }, [communityName, threadId, slug]);

  if ((!communityName && !threadId) || isLoading) {
    return <Loading />;
  }
  if (error) {
    return <>An error has occurred: {JSON.stringify(error)}</>;
  }
  return <View />;
}

function View() {
  const { threadProps, currentCommunity, permissions, settings } =
    useLinenStore((state) => ({
      threadProps: state.threadProps,
      currentCommunity: state.currentCommunity,
      permissions: state.permissions,
      settings: state.settings,
    }));

  if (!threadProps || !currentCommunity || !permissions || !settings) {
    return <Loading />;
  }

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
      useJoinContext={() => ({})} // used for sign ups
    />
  );
}
