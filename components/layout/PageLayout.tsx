import { Header, Button } from '@mantine/core';
import { ErrorBoundary } from 'react-error-boundary';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SlackIcon from '../icons/SlackIcon';
import SearchBar from '../search/SearchBar';
import { NavBar } from '../NavBar/NavBar';
import SEO from './SEO';
import { channels, users } from '@prisma/client';

interface Settings {
  brandColor: string;
  docsUrl: string;
  homeUrl: string;
  logoUrl: string;
}

interface Props {
  seo?: any;
  users?: users[];
  children: React.ReactNode;
  currentChannel: channels;
  navItems?: any;
  slackUrl?: string;
  settings: Settings;
  communityName?: string;
}

function PageLayout({
  seo = {},
  users,
  children,
  navItems,
  currentChannel,
  slackUrl,
  settings,
  communityName,
}: Props) {
  const {
    query: { channelName },
  } = useRouter();
  const channels = navItems.channels.filter((c: channels) => !c.hidden);

  return (
    <div>
      <Header
        sx={() => ({
          backgroundColor: settings.brandColor,
          display: 'flex',
          justifyContent: 'space-between',
        })}
        height={76}
        padding="lg"
      >
        <Link href={'/'} passHref>
          <img
            className="cursor-pointer h-full"
            src={settings.logoUrl}
            alt={`${settings.homeUrl} logo`}
          />
        </Link>
        <div
          className="flex"
          style={{
            minWidth: '250px',
            flex: '1 0 auto',
            justifyContent: 'flex-end',
          }}
        >
          <div className="hidden sm:flex w-full">
            <SearchBar channels={channels} users={users} />
          </div>
          <a
            className="hidden sm:block md:block"
            style={{ color: 'white', fontWeight: 500, marginRight: '24px' }}
            rel="noreferrer"
            target="_blank"
            href={settings.homeUrl}
          >
            Home
          </a>
          <a
            className="hidden sm:block"
            style={{ color: 'white', fontWeight: 500, marginRight: '24px' }}
            rel="noreferrer"
            target="_blank"
            href={settings.docsUrl}
          >
            Docs
          </a>
          <Button
            className="hidden sm:block"
            variant="white"
            style={{ backgroundColor: 'white' }}
            component="a"
            href={slackUrl}
          >
            <SlackIcon style={{ marginRight: '10px' }} />
            Join the Conversation
          </Button>
          <Button
            className=" sm:hidden"
            variant="white"
            style={{ backgroundColor: 'white' }}
            component="a"
            href={slackUrl}
          >
            <div className="px-1">
              <SlackIcon />
            </div>
            Join the Conversation
          </Button>
        </div>
      </Header>
      <div className="pt-3 sm:hidden w-full">
        <SearchBar channels={channels} users={users} />
      </div>
      <SEO
        image={undefined}
        url={undefined}
        title={communityName?.split('.')[0]}
        {...seo}
      />
      <div className="sm:flex">
        <div className="hidden md:flex">
          {NavBar(channels, currentChannel.channelName || '')}
        </div>
        <div className="lg:w-full">
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
    </div>
  );
}

export default PageLayout;
