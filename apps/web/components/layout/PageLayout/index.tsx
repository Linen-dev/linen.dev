import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Header from '@linen/ui/Header';
import ErrorFallback from './ErrorFallback';
import NavBar from '@linen/ui/NavBar';
import SEO, { type SeoProps } from '../SEO';
import GoogleAnalytics from '../GoogleAnalytics';
import Favicon from './Favicon';
import type {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedSearchMessage,
  Settings,
} from '@linen/types';
import { LinkContext } from '@linen/contexts/Link';
import { api } from 'utilities/requests';
import useMode from '@linen/hooks/mode';
import styles from './index.module.scss';
import Link from 'next/link';
import JoinButton from '@linen/ui/JoinButton';
import InternalLink from 'components/Link/InternalLink';
import { signOut, useSession } from '@linen/auth/client';
import usePath from 'hooks/path';
import { useRouter } from 'next/router';
import { notify } from 'utilities/notification';
import { getHomeUrl } from '@linen/utilities/home';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import { useJoinContext } from 'contexts/Join';

interface Props {
  className?: string;
  seo?: SeoProps;
  children: React.ReactNode;
  currentChannel?: SerializedChannel;
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  dms: SerializedChannel[];
  communities: SerializedAccount[];
  settings: Settings;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  innerRef?: any;
  onDrop?({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    to: string;
    from: string;
  }): void;
}

function PageLayout({
  className,
  seo,
  children,
  channels: initialChannels,
  communities,
  currentChannel,
  currentCommunity,
  settings,
  isSubDomainRouting,
  permissions,
  innerRef,
  dms,
  onDrop,
}: Props) {
  const [channels, setChannels] = useState(
    initialChannels.filter((c: SerializedChannel) => !c.hidden)
  );
  const { googleAnalyticsId, googleSiteVerification } = settings;
  const { mode } = useMode();
  const router = useRouter();
  const { startSignUp } = useJoinContext();
  const { status } = useSession();

  useEffect(() => {
    setChannels(initialChannels.filter((c: SerializedChannel) => !c.hidden));
  }, [initialChannels]);

  const handleSelect = ({ thread }: SerializedSearchMessage) => {
    let path = `/t/${thread.incrementId}/${thread.slug || 'topic'}`;
    if (!isSubDomainRouting) {
      path = `/${settings.communityType === 'discord' ? 'd' : 's'}/${
        settings.communityName
      }${path}`;
    }
    router.push(path);
  };

  const onJoinChannel = (channel: SerializedChannel) => {
    setChannels((channels) => {
      return [channel, ...channels].sort((a, b) =>
        a.displayOrder > b.displayOrder ? 1 : -1
      );
    });
  };

  const onLeaveChannel = (channel: SerializedChannel) => {
    setChannels((channels) => {
      return channels.filter(({ id }) => id !== channel.id);
    });
  };

  return (
    <LinkContext
      context={{
        isSubDomainRouting,
        communityName: settings.communityName,
        communityType: settings.communityType,
      }}
    >
      <div className={styles.push} />
      <div className={styles.header}>
        <Header
          channels={channels}
          channelName={currentChannel?.channelName}
          currentCommunity={currentCommunity}
          settings={settings}
          permissions={permissions}
          // dep injection
          api={api}
          InternalLink={InternalLink}
          JoinButton={JoinButton({
            startSignUp,
            status,
            api,
            reload: router.reload,
          })}
          Link={Link}
          signOut={signOut}
          usePath={usePath}
          routerAsPath={router.asPath}
          handleSelect={handleSelect}
        />
      </div>
      {seo && <SEO {...seo} />}
      <div className="flex flex-col lg:flex-row">
        <NavBar
          mode={mode}
          currentCommunity={currentCommunity}
          currentChannel={currentChannel}
          channels={channels}
          communities={communities}
          channelName={currentChannel?.channelName || ''}
          permissions={permissions}
          onDrop={onDrop}
          dms={dms}
          // injection
          Link={InternalLink}
          routerAsPath={router.asPath}
          usePath={usePath}
          getHomeUrl={getHomeUrl}
          api={api}
          notify={notify}
          onJoinChannel={onJoinChannel}
          onLeaveChannel={onLeaveChannel}
          CustomRouterPush={CustomRouterPush({
            isSubDomainRouting,
            communityName: settings.communityName,
            communityType: settings.communityType,
          })}
        />
        <div className={className || styles.container} ref={innerRef}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
          </ErrorBoundary>
        </div>
      </div>
      <div id="portal"></div>
      <div id="modal-portal"></div>
      <div id="tooltip-portal"></div>
      <div id="preview-portal"></div>
      <Favicon url={currentCommunity.faviconUrl} />
      <GoogleAnalytics
        googleAnalyticsId={googleAnalyticsId}
        googleSiteVerification={googleSiteVerification}
      />
    </LinkContext>
  );
}

export default PageLayout;
