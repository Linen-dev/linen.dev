import React from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { ErrorBoundary } from 'react-error-boundary';
import Header from './Header';
import ErrorFallback from './ErrorFallback';
import NavBar from 'components/NavBar';
import SEO, { type SeoProps } from '../SEO';
import GoogleAnalytics from '../GoogleAnalytics';
import Favicon from './Favicon';
import classNames from 'classnames';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import { LinkContext } from '@linen/contexts/Link';
import { put } from 'utilities/http';
import useMode from '@linen/hooks/mode';
import styles from './index.module.scss';

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

  const updateProfile = ({ displayName }: { displayName: string }) => {
    return put('/api/profile', {
      displayName,
    }).then(() => {
      // Potential improvement:
      // We could improve the behavior here
      // by updating the user information live.
      // It is a bit time consuming because
      // we would need to make currentUser dynamic
      // and update user information in all threads we have.
      // We would need to have a centralized store for users
      // which we could manipulate.
      window.location.reload();
    });
  };

  const uploadAvatar = (data: FormData, options: AxiosRequestConfig) => {
    return axios.post('/api/profile/avatar', data, options).then(() => {
      // same as in the comment above, we could make this dynamic by updating the user in the all user's list
      window.location.reload();
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
          mode={mode}
          channels={channels}
          channelName={currentChannel?.channelName}
          currentCommunity={currentCommunity}
          settings={settings}
          permissions={permissions}
          isSubDomainRouting={isSubDomainRouting}
          onProfileChange={updateProfile}
          onUpload={uploadAvatar}
        />
      </div>
      {seo && <SEO {...seo} />}
      <div className="flex flex-col lg:flex-row">
        <NavBar
          mode={mode}
          channels={channels}
          communities={communities}
          channelName={currentChannel?.channelName || ''}
          permissions={permissions}
          onDrop={onDrop}
          dms={dms}
        />
        <div
          className={
            className ||
            classNames(
              styles.container,
              'lg:h-[calc(100vh_-_64px)] lg:w-full',
              'lg:flex',
              'justify-center overflow-auto h-[calc(100vh_-_64px)] w-full'
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
      <Favicon url={currentCommunity.faviconUrl} />
      <GoogleAnalytics
        googleAnalyticsId={googleAnalyticsId}
        googleSiteVerification={googleSiteVerification}
      />
    </LinkContext>
  );
}

export default PageLayout;
