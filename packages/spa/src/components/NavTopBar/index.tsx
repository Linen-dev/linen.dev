import styles from './index.module.scss';
import Header from '@linen/ui/Header';
import InternalLink from '@/components/InternalLink';
import { signOut } from '@/components/SignOut';
import Loading from '@/components/Loading';
import { useLinenStore, shallow } from '@/store';
import { api } from '@/fetcher';
import { mockedComponent, mockedRouterAsPath } from '@/mock';
import customUsePath from '@/hooks/usePath';
import { useNavigate } from 'react-router-dom';

export default function NavTopBar() {
  const navigate = useNavigate();
  const {
    channels,
    channelName,
    permissions,
    currentCommunity,
    settings,
    communityName,
  } = useLinenStore(
    (state) => ({
      channels: state.channels,
      channelName: state.channelName,
      permissions: state.permissions,
      currentCommunity: state.currentCommunity,
      settings: state.settings,
      communityName: state.communityName,
    }),
    shallow
  );

  if (!communityName || !settings || !currentCommunity || !permissions)
    return <Loading />;

  return (
    <>
      <div className={styles.push} />
      <div className={styles.header}>
        <Header
          channels={channels}
          channelName={channelName}
          signOut={signOut}
          permissions={permissions}
          settings={settings}
          currentCommunity={currentCommunity}
          // component injection
          api={api}
          Link={InternalLink({ communityName })}
          InternalLink={InternalLink({ communityName })}
          usePath={customUsePath({ communityName })}
          handleSelect={({ thread }) => {
            navigate(
              `/s/${communityName}/t/${thread.incrementId}/${thread.slug}`
            );
          }}
          // TODO:
          routerAsPath={mockedRouterAsPath}
          JoinButton={mockedComponent}
        />
      </div>
    </>
  );
}
