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

const NavLink = styled(Anchor)({
  color: 'white',
  fontWeight: 500,
  marginRight: '24px',
});

function PageLayout({ seo = {}, users, children, navItems, slackUrl }) {
  const {
    query: { channelId },
  } = useRouter();
  const channels = navItems.channels;

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
            backgroundColor: '#1B194E',
            display: 'flex',
            justifyContent: 'space-between',
          })}
          height={76}
          padding="lg"
        >
          <Link href={'/'} passHref>
            <LogoImg
              height="100%"
              src="https://aws1.discourse-cdn.com/business7/uploads/airbyte/original/1X/04c9487f21ddc41f65ccac9e3d75b4bf8ea64d15.png"
            />
          </Link>
          <Group style={{ minWidth: '1044px' }}>
            <SearchBar channels={channels} users={users} />
            <NavLink target="_blank" href="https://airbyte.com/">
              Home
            </NavLink>
            <NavLink target="_blank" href="https://docs.airbyte.com/">
              Docs
            </NavLink>
            <Button variant="white" component="a" href={slackUrl}>
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
