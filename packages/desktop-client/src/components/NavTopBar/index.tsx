import styles from './index.module.scss';
import Header from '@linen/ui/Header';
import InternalLink from '@/components/InternalLink';
import { signOut } from '@/components/SignOut';
import { mockAccount, mockSettings } from '@/mocks';
import { useLinenStore, shallow } from '@/store';
import { api } from '@/fetcher';
import customUsePath from '@/hooks/usePath';
import { useNavigate, useLocation } from 'react-router-dom';
import JoinButton from '@linen/ui/JoinButton';
import TitleBar from '@/components/TitleBar';
import { useSession } from '@linen/auth-client/client';
import di from '@/di';
import { useEffect, useState } from 'react';

export default function NavTopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useSession();
  const [showLogo, setShowLogo] = useState(true);

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

  useEffect(() => {
    di.isDarwin().then(setShowLogo);
  }, []);

  return (
    <>
      <div className={styles.push} />
      <div className={styles.header}>
        {showLogo && <TitleBar currentCommunity={currentCommunity} />}
        <Header
          key={settings?.communityId}
          channels={channels}
          channelName={channelName}
          signOut={signOut}
          permissions={permissions || ({} as any)}
          settings={settings || mockSettings}
          currentCommunity={currentCommunity || mockAccount}
          logoClassName={showLogo ? styles.hiddenLogo : styles.visibleLogo}
          // component injection
          api={api}
          Link={communityName ? InternalLink({ communityName }) : () => {}}
          InternalLink={
            communityName ? InternalLink({ communityName }) : () => <></>
          }
          usePath={
            communityName
              ? customUsePath({ communityName })
              : ({ href }) => href
          }
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
          isSubDomainRouting={false}
        />
      </div>
    </>
  );
}
