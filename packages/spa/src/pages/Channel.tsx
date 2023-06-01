import { useNavigate, useParams } from 'react-router-dom';
import ChannelView from '@linen/ui/ChannelView';
import { useUsersContext } from '@linen/contexts/Users';
import { shallow, useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useQuery } from '@tanstack/react-query';
import { playNotificationSound } from '@/utils/playNotificationSound';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import customUsePath from '@/hooks/usePath';
import HandleError from '@/components/HandleError';
import startSignUp from '@/utils/startSignUp';
import { useLoading } from '@/components/Loading';
import { mockAccount, mockSettings } from '@/mocks';

type ChannelPageProps = {
  communityName: string;
  channelName?: string;
  page?: string;
};

export default function ChannelPage() {
  const { communityName, channelName, page } = useParams() as ChannelPageProps;
  const setChannelProps = useLinenStore((state) => state.setChannelProps);
  const [setLoading] = useLoading();

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
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    localStorage.set(
      'pages_last',
      `/s/${communityName}${
        channelName ? `/c/${channelName}${page ? `/${page}` : ''}` : ''
      }`
    );
  }, [communityName, channelName, page]);

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

  return (
    <ChannelView
      channelName={channelName || 'loading'}
      currentCommunity={currentCommunity || mockAccount}
      permissions={permissions || ({} as any)}
      settings={settings || mockSettings}
      currentChannel={currentChannel || ({} as any)}
      isBot={false}
      isSubDomainRouting={false}
      nextCursor={channelProps?.nextCursor || ({} as any)}
      pathCursor={channelProps?.pathCursor || ({} as any)}
      pinnedThreads={channelProps?.pinnedThreads || ({} as any)}
      threads={threads}
      useUsersContext={useUsersContext}
      api={api}
      playNotificationSound={playNotificationSound}
      usePath={communityName ? customUsePath({ communityName }) : () => {}}
      routerPush={navigate}
      startSignUp={
        permissions
          ? startSignUp({ permissions, reload: () => navigate(0) })
          : async () => {}
      }
      // TODO:
      queryIntegration={false}
    />
  );
}
