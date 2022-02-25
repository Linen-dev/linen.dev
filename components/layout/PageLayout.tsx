import {
  AppShell,
  Navbar,
  Header,
  Group,
  Title,
  Text,
  Paper,
  Anchor,
  Button,
} from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import SlackIcon from '../icons/SlackIcon';
import SearchBar from '../search/SearchBar';
import SEO from './SEO';

const LogoImg = styled.img({
  cursor: 'pointer',
});

function PageLayout({
  seo = {},
  users,
  children,
  navItems,
  slackUrl,
  foundLink,
}) {
  const {
    query: { channelId },
  } = useRouter();
  const channels = navItems.channels.filter((c) => !c.hidden);

  return (
    <AppShell
      padding="lg"
      fixed
      navbar={
        <Navbar
          sx={(theme) => ({ backgroundColor: '#white' })}
          width={{ base: 250 }}
          padding="lg"
        >
          <Group direction="column">
            <Paper
              shadow="md"
              style={{
                padding: '24px 0',
                width: '100%',
              }}
            >
              <Title style={{ paddingLeft: 24, marginBottom: 8 }} order={5}>
                Channels
              </Title>
              <div
                style={{
                  display: 'block',
                  height: 'calc(100vh - 200px)',
                  overflowY: 'auto',
                }}
              >
                {channels.map((c) => (
                  <Link key={c.id} href={`/channel/${c.id}`} passHref>
                    <Text
                      size="sm"
                      weight={channelId === c.id ? 700 : 500}
                      sx={(theme) => ({
                        cursor: 'pointer',
                        width: '100%',
                        padding: '12px 24px',
                        backgroundColor: 'white',
                        color: channelId === c.id ? '#1B194E' : 'black',
                        borderLeft: `3px solid ${
                          channelId === c.id ? '#1B194E' : 'transparent'
                        }`,
                        '&:hover': {
                          color: '#1B194E',
                        },
                      })}
                    >
                      # {c.channelName}
                    </Text>
                  </Link>
                ))}
              </div>
            </Paper>
          </Group>
        </Navbar>
      }
      header={
        <Header
          sx={(theme) => ({
            backgroundColor: foundLink.navBarColor,
            display: 'flex',
            justifyContent: 'space-between',
          })}
          height={76}
          padding="lg"
        >
          <Link href={'/'} passHref>
            <LogoImg height="100%" src={foundLink.logoUrl} />
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
              href={foundLink.homeUrl}
            >
              Home
            </a>
            <a
              style={{ color: 'white', fontWeight: 500, marginRight: '24px' }}
              rel="noreferrer"
              target="_blank"
              href={foundLink.docsUrl}
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
      }
      styles={(theme) => ({
        main: {
          backgroundColor: 'white',
          paddingRight: 20,
          paddingBottom: 20,
        },
      })}
    >
      <SEO image={undefined} url={undefined} {...seo} />
      {children}
    </AppShell>
  );
}

export default PageLayout;
