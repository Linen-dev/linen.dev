import { useNavigate, useParams } from 'react-router-dom';
import ChannelView from '@linen/ui/ChannelView';
import { useUsersContext } from '@linen/contexts/Users';
import { shallow, useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useQuery } from '@tanstack/react-query';
import { playNotificationSound } from '@/utils/playNotificationSound';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import customUsePath from '@/hooks/usePath';
import HandleError from '@/components/HandleError';
import startSignUp from '@/utils/startSignUp';

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
        setChannelProps(data);
        return data;
      }),
    enabled: !!communityName,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    localStorage.set(
      'pages_last',
      `/s/${communityName}${
        channelName ? `/c/${channelName}${page ? `/${page}` : ''}` : ''
      }`
    );
  }, [communityName, channelName, page]);

  if (!communityName || isLoading) {
    return <Loading />;
  }
  if (error) {
    return HandleError(error);
  }
  return <View />;
}

function View() {
  const navigate = useNavigate();
  const {
    channelProps,
    currentCommunity,
    permissions,
    settings,
    channelName,
    communityName,
    currentChannel,
    threads,
  } = useLinenStore(
    (state) => ({
      channelProps: state.channelProps,
      currentCommunity: state.currentCommunity,
      permissions: state.permissions,
      settings: state.settings,
      channelName: state.channelName,
      communityName: state.communityName,
      currentChannel: state.currentChannel,
      threads: state.threads,
    }),
    shallow
  );

  if (
    !communityName ||
    !channelProps ||
    !currentCommunity ||
    !permissions ||
    !settings ||
    !channelName ||
    !currentChannel
  )
    return <Loading />;

  return (
    <ChannelView
      channelName={channelName}
      currentCommunity={currentCommunity}
      permissions={permissions}
      settings={settings}
      currentChannel={currentChannel}
      isBot={false}
      isSubDomainRouting={false}
      nextCursor={channelProps.nextCursor}
      pathCursor={channelProps.pathCursor}
      pinnedThreads={channelProps.pinnedThreads}
      threads={threads}
      useUsersContext={useUsersContext}
      api={api}
      playNotificationSound={playNotificationSound}
      usePath={customUsePath({ communityName })}
      routerPush={navigate}
      startSignUp={startSignUp({ permissions, reload: () => navigate(0) })}
      // TODO:
      queryIntegration={false}
    />
  );
}
