import { useLocation } from 'react-router-dom';
import useMode from '@linen/hooks/mode';
import { useUsersContext } from '@linen/contexts/Users';
import NavBar from '@linen/ui/NavBar';
import OnChannelDrop from '@linen/ui/OnChannelDrop';
import { api } from '@/fetcher';
import { useLinenStore, shallow } from '@/store';
import di from '@/di';
import customUsePath from '@/hooks/usePath';
import InternalLink from '@/components/InternalLink';
import Loading from '@/components/Loading';
import CustomRouterPush from '@/components/CustomRouterPush';

export default function NavLeftBar() {
  const location = useLocation();
  const { mode } = useMode();
  const {
    channels,
    channelName,
    permissions,
    currentCommunity,
    settings,
    communityName,
    communities,
    dms,
    currentChannel,
    threads,
    setThreads,
  } = useLinenStore(
    (state) => ({
      channels: state.channels,
      channelName: state.channelName,
      permissions: state.permissions,
      currentCommunity: state.currentCommunity,
      settings: state.settings,
      communityName: state.communityName,
      communities: state.communities,
      dms: state.dms,
      currentChannel: state.currentChannel,
      threads: state.threads,
      setThreads: state.setThreads,
    }),
    shallow
  );
  const [allUsers] = useUsersContext();

  if (!settings || !currentCommunity || !permissions || !communityName)
    return <Loading />;

  return (
    <NavBar
      currentCommunity={currentCommunity}
      communities={communities}
      api={api}
      mode={mode}
      channelName={channelName}
      permissions={permissions}
      channels={channels}
      dms={dms}
      // components injection
      Link={InternalLink({ communityName })}
      getHomeUrl={di.getHomeUrl}
      usePath={customUsePath({ communityName })}
      notify={(body: string) => di.sendNotification(body)}
      CustomRouterPush={CustomRouterPush({
        communityName,
        communityType: settings.communityType,
      })}
      routerAsPath={location.pathname}
      onDrop={
        currentChannel
          ? OnChannelDrop({
              setThreads,
              currentCommunity,
              api,
              currentChannel,
              threads,
              allUsers,
            })
          : () => {}
      }
    />
  );
}
