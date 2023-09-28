import { Link, useLocation } from 'react-router-dom';
import useMode from '@linen/hooks/mode';
import { useUsersContext } from '@linen/contexts/Users';
import NavBar from '@linen/ui/NavBar';
import OnChannelDrop from '@linen/ui/OnChannelDrop';
import { api } from '@/fetcher';
import { useLinenStore, shallow } from '@/store';
import di from '@/di';
import customUsePath from '@/hooks/usePath';
import InternalLink from '@/components/InternalLink';
import CustomRouterPush from '@/components/CustomRouterPush';
import { mockAccount } from '@/mocks';
import { SerializedChannel } from '@linen/types';

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
    setChannels,
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
      setChannels: state.setChannels,
    }),
    shallow
  );
  const [allUsers] = useUsersContext();

  function onJoinChannel(channel: SerializedChannel) {
    setChannels([...channels, channel]);
  }
  function onLeaveChannel(channel: SerializedChannel) {
    setChannels(channels.filter(({ id }) => id !== channel.id));
  }

  return (
    <NavBar
      currentCommunity={currentCommunity || mockAccount}
      currentChannel={currentChannel}
      communities={communities}
      api={api}
      mode={mode}
      channelName={channelName}
      permissions={permissions || ({} as any)}
      channels={channels.filter((c) => !c.hidden)}
      dms={dms}
      // components injection
      Link={communityName ? InternalLink({ communityName }) : () => <></>}
      getHomeUrl={di.getHomeUrl}
      usePath={
        communityName ? customUsePath({ communityName }) : ({ href }) => href
      }
      notify={di.sendNotification}
      CustomRouterPush={
        communityName && settings
          ? CustomRouterPush({
              communityName,
              communityType: settings.communityType,
            })
          : () => {}
      }
      routerAsPath={location.pathname}
      onDrop={
        currentChannel && currentCommunity
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
      CustomLink={({ href, className, onClick, children }) => (
        <Link to={href} onClick={onClick} className={className}>
          {children}
        </Link>
      )}
      onJoinChannel={onJoinChannel}
      onLeaveChannel={onLeaveChannel}
    />
  );
}
