import { useParams } from 'react-router-dom';
import ChannelView from '@linen/ui/ChannelView';
import { useUsersContext } from '@linen/contexts/Users';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { mockedComponent, mockedContext } from '@/mock';
import { useQuery } from '@tanstack/react-query';
import { playNotificationSound } from '@/utils/playNotificationSound';

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
      api.getChannelProps({ communityName, channelName, page }).then((data) => {
        setChannelProps(data, communityName);
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
  const { channelProps, currentCommunity, permissions, settings, channelName } =
    useLinenStore((state) => ({
      channelProps: state.channelProps,
      currentCommunity: state.currentCommunity,
      permissions: state.permissions,
      settings: state.settings,
      channelName: state.channelName,
    }));

  if (
    !channelProps ||
    !currentCommunity ||
    !permissions ||
    !settings ||
    !channelName
  )
    return <Loading />;

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
