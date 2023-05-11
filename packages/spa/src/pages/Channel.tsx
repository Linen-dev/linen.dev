import { useParams } from 'react-router-dom';
import ChannelView from '@linen/ui/ChannelView';
import { useUsersContext } from '@linen/contexts/Users';
import { qs } from '@linen/utilities/url';
import { useLinenStore } from '../store';
import Loading from '../components/Loading';
import { api } from '../fetcher';
import { mockedComponent, mockedContext } from '../mock';
import { useQuery } from '@tanstack/react-query';
import { ChannelProps } from '@linen/types';
import { playNotificationSound } from '../utils/playNotificationSound';

type ChannelPageProps = {
  communityName: string;
  channelName?: string;
  page?: string;
};

export default function ChannelPage() {
  const { communityName, channelName, page } = useParams() as ChannelPageProps;
  const setChannelProps = useLinenStore((state) => state.setChannelProps);
  const { isLoading, error } = useQuery({
    queryKey: ['channels', { communityName, channelName, page }],
    queryFn: () =>
      api
        .get<ChannelProps>(
          `/api/ssr/channels?${qs({ communityName, channelName, page })}`
        )
        .then((data) => {
          setChannelProps(data, communityName);
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
  const channelProps = useLinenStore((state) => state.channelProps);
  const currentCommunity = useLinenStore((state) => state.currentCommunity);
  const permissions = useLinenStore((state) => state.permissions);
  const settings = useLinenStore((state) => state.settings);
  const channelName = useLinenStore((state) => state.channelName);

  if (!channelProps) return <Loading />;
  if (!currentCommunity) return <Loading />;
  if (!permissions) return <Loading />;
  if (!settings) return <Loading />;
  if (!channelName) return <Loading />;

  return (
    <ChannelView
      channelName={channelName}
      currentCommunity={currentCommunity}
      permissions={permissions}
      settings={settings}
      currentChannel={channelProps.currentChannel}
      isBot={channelProps.isBot}
      isSubDomainRouting={channelProps.isSubDomainRouting}
      nextCursor={channelProps.nextCursor}
      pathCursor={channelProps.pathCursor}
      pinnedThreads={channelProps.pinnedThreads}
      threads={channelProps.threads}
      useUsersContext={useUsersContext}
      api={api}
      playNotificationSound={playNotificationSound}
      // TODO:
      addReaction={(a) => a}
      IntegrationsModal={mockedComponent}
      JoinChannelLink={mockedComponent}
      MembersModal={mockedComponent}
      Pagination={mockedComponent}
      ShowIntegrationDetail={mockedComponent}
      queryIntegration={'TODO'}
      useJoinContext={mockedContext}
    />
  );
}
