import { AppShell, Header, Group, Anchor, Button } from '@mantine/core';
import Image from 'next/image';
// import {Header} from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import SlackIcon from '../icons/SlackIcon';
import SearchBar from '../search/SearchBar';
import { NavBar } from '../NavBar/NavBar';
import SEO from './SEO';

const LogoImg = styled.img({
  cursor: 'pointer',
});

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
    query: { channelId },
  } = useRouter();
  const channels = navItems.channels.filter((c) => !c.hidden);

  return (
    <div>
      <Header
        sx={(theme) => ({
          backgroundColor: settings.brandColor,
          display: 'flex',
          justifyContent: 'space-between',
        })}
        height={76}
        padding="lg"
      >
        <Link href={'/'} passHref>
          <LogoImg className="h-full" src={settings.logoUrl} />
        </Link>
        <Group
          style={{
            minWidth: '300px',
            flex: '1 0 auto',
            justifyContent: 'flex-end',
          }}
        >
          <SearchBar channels={channels} users={users} />
          <a
            className="hidden sm:block"
            style={{ color: 'white', fontWeight: 500, marginRight: '24px' }}
            rel="noreferrer"
            target="_blank"
            href={settings.homeUrl}
          >
            Home
          </a>
          <a
            style={{ color: 'white', fontWeight: 500, marginRight: '24px' }}
            rel="noreferrer"
            target="_blank"
            href={settings.docsUrl}
          >
            Docs
          </a>
          <Button
            variant="white"
            style={{ backgroundColor: 'white' }}
            component="a"
            href={slackUrl}
          >
            <SlackIcon style={{ marginRight: '10px' }} />
            Join the Conversation
          </Button>
        </Group>
      </Header>
      <SEO
        image={undefined}
        url={undefined}
        title={communityName?.split('.')[0]}
        {...seo}
      />
      <div className="sm:flex">
        <div className="hidden lg:flex">{NavBar(channels, channelId)}</div>
        <div className="lg:w-full">{children}</div>
      </div>
    </div>
  );
}

export default PageLayout;
