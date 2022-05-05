import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';
import SlackIcon from '../../icons/SlackIcon';
import SearchBar from '../../search/SearchBar';
import { NavBar } from '../../NavBar/NavBar';
import SEO from '../SEO';
import { channels, users } from '@prisma/client';
import { addHttpsToUrl, pickTextColorBasedOnBgColor } from '../../../lib/util';

interface Settings {
  brandColor: string;
  docsUrl: string;
  homeUrl: string;
  logoUrl: string;
  googleAnalyticsId?: string;
}

interface Props {
  seo?: any;
  users?: users[];
  children: React.ReactNode;
  currentChannel: channels;
  navItems?: any;
  slackUrl?: string;
  slackInviteUrl?: string;
  settings: Settings;
  communityName: string;
  isSubDomainRouting: boolean;
}

function PageLayout({
  seo = {},
  users,
  children,
  navItems,
  currentChannel,
  slackUrl,
  slackInviteUrl,
  settings,
  communityName,
  isSubDomainRouting,
}: Props) {
  const channels = navItems.channels.filter((c: channels) => !c.hidden);
  const homeUrl = addHttpsToUrl(settings.homeUrl);
  const docsUrl = addHttpsToUrl(settings.docsUrl);
  const logoUrl = addHttpsToUrl(settings.logoUrl);
  const { googleAnalyticsId } = settings;
  const fontColor = pickTextColorBasedOnBgColor(
    settings.brandColor,
    'white',
    'black'
  );

  return (
    <div>
      <div
        className={'flex h-20 px-4 py-4 items-center'}
        // Couldn't get the background color to work with tailwind custom color
        style={{ backgroundColor: settings.brandColor }}
      >
        <Link href={'/'} passHref>
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
              users={users}
              communityName={communityName}
              isSubDomainRouting={isSubDomainRouting}
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
          <a
            className="hidden sm:inline-flex items-center px-3 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-500"
            style={{ backgroundColor: 'white', minWidth: '200px' }}
            href={slackInviteUrl || slackUrl}
          >
            <SlackIcon style={{ marginRight: '10px' }} />
            Join the conversation
          </a>
          <a
            className="sm:hidden inline-flex items-center px-3 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-blue-500"
            style={{ backgroundColor: 'white' }}
            href={slackInviteUrl || slackUrl}
          >
            <SlackIcon style={{ marginRight: '10px' }} />
            Join Slack
          </a>
        </div>
      </div>
      <div className="pt-3 sm:hidden w-full">
        <SearchBar
          channels={channels}
          users={users}
          communityName={communityName}
          isSubDomainRouting={isSubDomainRouting}
        />
      </div>
      <SEO
        image={undefined}
        url={undefined}
        title={communityName?.split('.')[0]}
        {...seo}
      />
      <div className="sm:flex">
        <div className="hidden md:flex">
          {NavBar(
            channels,
            currentChannel.channelName || '',
            communityName,
            isSubDomainRouting
          )}
        </div>
        <div className="md:flex justify-center lg:w-full">
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
      {googleAnalyticsId && (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
        />
      )}
    </div>
  );
}

export default PageLayout;
