import styles from './index.module.scss';
import Header from '@linen/ui/Header';
import InternalLink from '@/components/InternalLink';
import { signOut } from '@/components/SignOut';
import Loading from '@/components/Loading';
import { useLinenStore, shallow } from '@/store';
import { api } from '@/fetcher';
import customUsePath from '@/hooks/usePath';
import { useNavigate, useLocation } from 'react-router-dom';
import JoinButton from '@linen/ui/JoinButton';
import TitleBar from '@/components/TitleBar';
import { useSession } from '@linen/auth/client';

export default function NavTopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSession();

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
      <TitleBar currentCommunity={currentCommunity} />
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
          routerAsPath={location.pathname}
          JoinButton={JoinButton({
            startSignUp: async (_) => {}, // no signups on SPA
            status,
            api,
            reload: () => navigate(0),
          })}
        />
      </div>
    </>
  );
}
