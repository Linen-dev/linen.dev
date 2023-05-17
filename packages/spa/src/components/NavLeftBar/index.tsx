import NavBar from '@linen/ui/NavBar';
import useMode from '@linen/hooks/mode';
import InternalLink from '@/components/InternalLink';
import { mockedRouterAsPath, mockedFunction } from '@/mock';
import { useLinenStore, shallow } from '@/store';
import { api } from '@/fetcher';
import Loading from '@/components/Loading';
import customUsePath from '@/hooks/usePath';
import { getHomeUrl, sendNotification } from '@/di';
import CustomRouterPush from '@/components/CustomRouterPush';

export default function NavLeftBar() {
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
    }),
    shallow
  );

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
      getHomeUrl={getHomeUrl}
      usePath={customUsePath({ communityName })}
      notify={(body: string) => sendNotification(body)}
      CustomRouterPush={CustomRouterPush({
        communityName,
        communityType: settings.communityType,
      })}
      // TODO:
      routerAsPath={mockedRouterAsPath}
      onDrop={mockedFunction}
    />
  );
}
