import { useParams } from 'react-router-dom';
import ThreadView from '@linen/ui/ThreadView';
import { useUsersContext } from '@linen/contexts/Users';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useQuery } from '@tanstack/react-query';
import { localStorage } from '@linen/utilities/storage';
import { useEffect } from 'react';
import HandleError from '@/components/HandleError';
import { useLoading } from '@/components/Loading';
import { mockAccount, mockSettings, mockThread } from '@/mocks';

type ThreadPageProps = {
  communityName: string;
  threadId: string;
  slug?: string;
};

export default function ThreadPage() {
  const { communityName, threadId, slug } = useParams() as ThreadPageProps;
  const setThreadsProps = useLinenStore((state) => state.setThreadsProps);
  const [setLoading] = useLoading();
  const { isLoading, error } = useQuery({
    queryKey: ['threads', { communityName, threadId, slug }],
    queryFn: () =>
      api.getThreadProps({ communityName, threadId, slug }).then((data) => {
        setThreadsProps(data);
        return data;
      }),
    enabled: !!communityName && !!threadId,
    retry: false,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/t/${threadId}/${slug}`);
  }, [communityName, threadId, slug]);

  if (error) {
    return HandleError(error);
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

  return (
    <ThreadView
      key={threadProps?.thread.id}
      currentChannel={threadProps?.currentChannel || ({} as any)}
      isSubDomainRouting={false}
      thread={threadProps?.thread || mockThread}
      threadUrl={threadProps?.threadUrl || 'loading'}
      isBot={false}
      currentCommunity={currentCommunity || mockAccount}
      permissions={permissions || ({} as any)}
      settings={settings || mockSettings}
      api={api}
      useUsersContext={useUsersContext}
      useJoinContext={() => ({})} // used for sign ups
    />
  );
}
