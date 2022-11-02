import { ErrorBoundary } from 'react-error-boundary';
import Header from './Header';
import SearchBar from '../../search/SearchBar';
import NavBar from 'components/NavBar';
import SEO, { type SeoProps } from '../SEO';
import type { ChannelSerialized } from 'lib/channel';
import GoogleAnalytics from '../GoogleAnalytics';
import styles from './index.module.css';
import classNames from 'classnames';
import { Permissions } from 'types/shared';
import { LinkContext } from 'contexts/Link';
import { Settings } from 'serializers/account/settings';
import { put } from 'utilities/http';
import useMode from 'hooks/mode';

interface Props {
  className?: string;
  seo?: SeoProps;
  children: React.ReactNode;
  currentChannel?: ChannelSerialized;
  channels: ChannelSerialized[];
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
  currentChannel,
  settings,
  isSubDomainRouting,
  permissions,
  innerRef,
  onDrop,
}: Props) {
  const channels = initialChannels.filter((c: ChannelSerialized) => !c.hidden);
  const { googleAnalyticsId, googleSiteVerification } = settings;
  const { mode } = useMode();

  const updateProfile = ({
    displayName,
    userId,
  }: {
    displayName: string;
    userId: string;
  }) => {
    return put('/api/profile', {
      userId,
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
          settings={settings}
          permissions={permissions}
          isSubDomainRouting={isSubDomainRouting}
          onProfileChange={updateProfile}
        />
      </div>
      <div className="sm:hidden w-full">
        <SearchBar
          borderColor="#fff"
          channels={channels}
          communityName={settings.communityName}
          isSubDomainRouting={isSubDomainRouting}
          communityType={settings.communityType}
        />
      </div>
      {seo && <SEO {...seo} />}
      <div className="flex flex-col lg:flex-row">
        <NavBar
          mode={mode}
          channels={channels}
          channelName={currentChannel?.channelName || ''}
          permissions={permissions}
          onDrop={onDrop}
        />
        <div
          className={
            className ||
            classNames(
              'lg:h-[calc(100vh_-_64px)] lg:w-full',
              'md:flex',
              'sm:h-[calc(100vh_-_144px)]',
              'justify-center overflow-auto h-[calc(100vh_-_152px)] w-full'
            )
          }
          ref={innerRef}
        >
          <ErrorBoundary
            FallbackComponent={() => (
              <>
                <h1 className="font-bold text-blue-600 text-center text-9xl pt-6">
                  500
                </h1>
                <h6 className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl">
                  <span className="text-red-500">Oops!</span> Something went
                  wrong
                </h6>
                <p className="mb-8 text-center text-gray-500 md:text-lg">
                  Please try again or contact us
                </p>
              </>
            )}
          >
            {children}
          </ErrorBoundary>
        </div>
      </div>
      <GoogleAnalytics
        googleAnalyticsId={googleAnalyticsId}
        googleSiteVerification={googleSiteVerification}
      />
    </LinkContext>
  );
}

export default PageLayout;
