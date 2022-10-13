import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';
import SearchBar from '../../search/SearchBar';
import NavBar from 'components/NavBar';
import SEO, { type SeoProps } from '../SEO';
import type { ChannelSerialized } from 'lib/channel';
import { addHttpsToUrl } from 'utilities/url';
import { pickTextColorBasedOnBgColor } from 'utilities/util';
import GoogleAnalytics from '../GoogleAnalytics';
import JoinButton from 'components/JoinButton';
import styles from './index.module.css';
import classNames from 'classnames';
import { Permissions } from 'types/shared';
import { LinkContext } from 'contexts/Link';
import { UsersContext } from 'contexts/Users';
import { Settings } from 'serializers/account/settings';
import { SerializedUser } from 'serializers/user';

interface Props {
  className?: string;
  seo?: SeoProps;
  children: React.ReactNode;
  currentChannel?: ChannelSerialized;
  currentUser?: SerializedUser | null;
  channels?: ChannelSerialized[];
  communityUrl?: string;
  communityInviteUrl?: string;
  settings: Settings;
  communityName: string;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  innerRef?: any;
  token: string | null;
}

function PageLayout({
  className,
  seo,
  children,
  channels: initialChannels,
  currentChannel,
  currentUser,
  communityUrl,
  communityInviteUrl,
  settings,
  communityName,
  isSubDomainRouting,
  permissions,
  innerRef,
  token,
}: Props) {
  const channels = initialChannels
    ? initialChannels.filter((c: ChannelSerialized) => !c.hidden)
    : [];
  const homeUrl = addHttpsToUrl(settings.homeUrl);
  const docsUrl = addHttpsToUrl(settings.docsUrl);
  const logoUrl = addHttpsToUrl(settings.logoUrl);
  const { googleAnalyticsId, googleSiteVerification } = settings;
  const fontColor = pickTextColorBasedOnBgColor(
    settings.brandColor,
    'white',
    'black'
  );

  return (
    <LinkContext
      context={{
        isSubDomainRouting,
        communityName: settings.communityName,
        communityType: settings.communityType,
      }}
    >
      <UsersContext>
        <div className={styles.push} />
        <div className={styles.header}>
          <div
            className="flex h-16 px-4 py-2 items-center"
            style={{ backgroundColor: settings.brandColor, gap: '24px' }}
          >
            <Link href={homeUrl || '/'} passHref>
              <a className="cursor-pointer block" target="_blank">
                <img
                  className="block"
                  style={{ height: '32px' }}
                  src={logoUrl}
                  height="32"
                  alt={`${homeUrl} logo`}
                />
              </a>
            </Link>
            <div
              className="flex w-full items-center"
              style={{
                justifyContent: 'flex-end',
                gap: '24px',
              }}
            >
              <div className="hidden sm:flex w-full">
                <SearchBar
                  channels={channels}
                  communityName={communityName}
                  isSubDomainRouting={isSubDomainRouting}
                  communityType={settings.communityType}
                />
              </div>
              <a
                className="hidden sm:flex items-center text-sm"
                style={{ color: fontColor, fontWeight: 500 }}
                rel="noreferrer"
                title="Documentation"
                target="_blank"
                href={docsUrl}
              >
                Docs
              </a>
              <JoinButton
                inviteUrl={communityInviteUrl || communityUrl}
                communityType={settings.communityType}
                communityId={settings.communityId}
                permissions={permissions}
              />
            </div>
          </div>
        </div>
        <div className="py-1 sm:hidden w-full">
          <SearchBar
            channels={channels}
            communityName={communityName}
            isSubDomainRouting={isSubDomainRouting}
            communityType={settings.communityType}
          />
        </div>
        {seo && <SEO {...seo} />}
        <div className="flex flex-col lg:flex-row">
          <NavBar
            channels={channels}
            channelName={currentChannel?.channelName || ''}
            currentUser={currentUser}
            permissions={permissions}
            token={token}
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
      </UsersContext>
    </LinkContext>
  );
}

export default PageLayout;
