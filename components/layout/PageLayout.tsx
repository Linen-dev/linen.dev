import { AppShell, Header, Group, Anchor, Button } from '@mantine/core';
import Image from 'next/image';
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
}

function PageLayout({
  seo = {},
  users,
  children,
  navItems,
  slackUrl,
  settings,
}: Props) {
  const {
    query: { channelId },
  } = useRouter();
  const channels = navItems.channels.filter((c) => !c.hidden);

  return (
    <div
    // styles={(theme) => ({
    //   main: {
    //     backgroundColor: 'white',
    //     paddingRight: 20,
    //     paddingBottom: 20,
    //   },
    // })}
    >
      {/* {NavBar(channels, channelId)} */}
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
          <LogoImg width="130px" src={settings.logoUrl} />
        </Link>
        <Group
          style={{
            minWidth: '1044px',
            flex: '1 0 auto',
            justifyContent: 'flex-end',
          }}
        >
          <SearchBar channels={channels} users={users} />
          <a
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
      <SEO image={undefined} url={undefined} {...seo} />
      {children}
    </div>
    // <AppShell
    //   padding="lg"
    //   fixed
    //   navbar={
    //     NavBar(channels, channelId)
    //   }
    //   header={

    //   }
    //   styles={(theme) => ({
    //     main: {
    //       backgroundColor: 'white',
    //       paddingRight: 20,
    //       paddingBottom: 20,
    //     },
    //   })}
    // >
    //   <SEO image={undefined} url={undefined} {...seo} />
    //   {children}
    // </AppShell>
  );
}

export default PageLayout;
