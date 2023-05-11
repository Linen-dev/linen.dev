import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Header from '@linen/ui/Header';
import ErrorFallback from './ErrorFallback';
import NavBar from '@linen/ui/NavBar';
import SEO, { type SeoProps } from '../SEO';
import GoogleAnalytics from '../GoogleAnalytics';
import Favicon from './Favicon';
import classNames from 'classnames';
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
import JoinButton from 'components/JoinButton';
import InternalLink from 'components/Link/InternalLink';
import { signOut } from '@linen/auth/client';
import usePath from 'hooks/path';
import { useRouter } from 'next/router';
import NewCommunityModal from 'components/Modals/NewCommunityModal';
import { notify } from 'utilities/notification';
import NewChannelModal from 'components/Modals/NewChannelModal';
import { getHomeUrl } from '@linen/utilities/home';
import NewDmModal from 'components/Modals/NewDmModal';

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
  const channels = initialChannels.filter((c: SerializedChannel) => !c.hidden);
  const { googleAnalyticsId, googleSiteVerification } = settings;
  const { mode } = useMode();
  const router = useRouter();

  const handleSelect = ({ thread }: SerializedSearchMessage) => {
    let path = `/t/${thread.incrementId}/${thread.slug || 'topic'}`;
    if (!isSubDomainRouting) {
      path = `/${settings.communityType === 'discord' ? 'd' : 's'}/${
        settings.communityName
      }${path}`;
    }
    router.push(path);
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
          JoinButton={JoinButton}
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
          NewChannelModal={NewChannelModal}
          NewCommunityModal={NewCommunityModal}
          NewDmModal={NewDmModal}
          api={api}
          notify={notify}
        />
        <div
          className={
            className ||
            classNames(
              styles.container,
              'lg:h-[calc(100vh_-_54px)] lg:w-full',
              'lg:flex',
              'justify-center h-[calc(100vh_-_54px)] w-full',
              'overflow-auto'
            )
          }
          ref={innerRef}
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
          </ErrorBoundary>
        </div>
      </div>
      <div id="portal"></div>
      <div id="modal-portal"></div>
      <div id="tooltip-portal"></div>
      <Favicon url={currentCommunity.faviconUrl} />
      <GoogleAnalytics
        googleAnalyticsId={googleAnalyticsId}
        googleSiteVerification={googleSiteVerification}
      />
    </LinkContext>
  );
}

export default PageLayout;
