import { Header, Button } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SlackIcon from '../icons/SlackIcon';
import SearchBar from '../search/SearchBar';
import { NavBar } from '../NavBar/NavBar';
import SEO from './SEO';

interface Settings {
  brandColor: string;
  docsUrl: string;
  homeUrl: string;
  logoUrl: string;
}

interface Props {
  seo?: any;
  users?: any[];
  children: React.ReactNode;
  navItems?: any;
  slackUrl?: string;
  settings?: Settings;
  communityName?: string;
}

function PageLayout({
  seo = {},
  users,
  children,
  navItems,
  slackUrl,
  settings,
  communityName,
}: Props) {
  const {
    query: { channelName },
  } = useRouter();
  const channels = navItems.channels.filter((c) => !c.hidden);

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
        <div className="hidden md:flex">{NavBar(channels, channelName)}</div>
        <div className="lg:w-full">{children}</div>
      </div>
    </div>
  );
}

export default PageLayout;
