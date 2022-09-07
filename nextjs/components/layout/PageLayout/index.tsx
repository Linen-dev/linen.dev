import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';
import SearchBar from '../../search/SearchBar';
import NavBar from '../../NavBar';
import SEO, { type SeoProps } from '../SEO';
import type { channels } from '@prisma/client';
import { addHttpsToUrl } from 'utilities/url';
import { pickTextColorBasedOnBgColor } from 'utilities/util';
import GoogleAnalytics from '../GoogleAnalytics';
import JoinDiscord from 'components/JoinDiscord';
import JoinSlack from 'components/JoinSlack';
import styles from './index.module.css';
import classNames from 'classnames';

interface Settings {
  brandColor: string;
  docsUrl: string;
  homeUrl: string;
  logoUrl: string;
  googleAnalyticsId?: string;
  googleSiteVerification?: string;
  communityType: string;
}

interface Props {
  seo?: SeoProps;
  children: React.ReactNode;
  currentChannel?: channels;
  channels?: channels[];
  communityUrl?: string;
  communityInviteUrl?: string;
  settings: Settings;
  communityName: string;
  isSubDomainRouting: boolean;
}

function PageLayout({
  seo,
  children,
  channels: initialChannels,
  currentChannel,
  communityUrl,
  communityInviteUrl,
  settings,
  communityName,
  isSubDomainRouting,
}: Props) {
  const channels = initialChannels
    ? initialChannels.filter((c: channels) => !c.hidden)
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
    <div>
      <div className={styles.push} />
      <div className={styles.header}>
        <div
          className="flex h-20 px-4 py-4 items-center"
          // Couldn't get the background color to work with tailwind custom color
          style={{ backgroundColor: settings.brandColor }}
        >
          <Link href="/">
            <img
              className="cursor-pointer max-h-8"
              src={logoUrl}
              alt={`${homeUrl} logo`}
            />
          </Link>
          <div
            className="flex w-full"
            style={{
              justifyContent: 'flex-end',
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
              className="hidden sm:block md:block pt-1"
              style={{ color: fontColor, fontWeight: 500, marginRight: '24px' }}
              rel="noreferrer"
              target="_blank"
              href={homeUrl}
            >
              Home
            </a>
            <a
              className="hidden sm:block pt-1"
              style={{ color: fontColor, fontWeight: 500, marginRight: '24px' }}
              rel="noreferrer"
              target="_blank"
              href={docsUrl}
            >
              Docs
            </a>
            {settings.communityType === 'discord' ? (
              <JoinDiscord inviteUrl={communityInviteUrl || communityUrl} />
            ) : (
              <JoinSlack inviteUrl={communityInviteUrl || communityUrl} />
            )}
          </div>
        </div>
      </div>
      <div className="pt-3 sm:hidden w-full">
        <SearchBar
          channels={channels}
          communityName={communityName}
          isSubDomainRouting={isSubDomainRouting}
          communityType={settings.communityType}
        />
      </div>
      {seo && <SEO {...seo} />}
      <div className="flex flex-col lg:flex-row">
        {NavBar({
          channels,
          channelName: currentChannel?.channelName || '',
          communityName,
          communityType: settings.communityType,
          isSubDomainRouting,
        })}
        <div
          className={classNames(
            'lg:h-[calc(100vh_-_80px)] lg:w-full',
            'md:flex',
            'sm:h-[calc(100vh_-_144px)]',
            'justify-center overflow-auto h-[calc(100vh_-_192px)] w-full'
          )}
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
    </div>
  );
}

export default PageLayout;
