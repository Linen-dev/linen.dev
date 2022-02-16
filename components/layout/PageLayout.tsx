import {
  AppShell,
  Navbar,
  Header,
  Group,
  Title,
  Text,
  Paper,
} from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { channels } from '../../constants/examples';
import SEO from './SEO';

function PageLayout({ seo = {}, children }) {
  const {
    query: { channelId },
  } = useRouter();

  return (
    <AppShell
      padding="lg"
      fixed
      navbar={
        <Navbar
          sx={(theme) => ({ backgroundColor: '#FEF9F4' })}
          width={{ base: 300 }}
          padding="lg"
        >
          <Group direction="column">
            <Paper
              shadow="md"
              style={{
                padding: '24px 0',
                width: '100%',
                border: '1px solid #e9ecef',
              }}
            >
              <Title style={{ paddingLeft: 24, marginBottom: 8 }} order={5}>
                Channels
              </Title>
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
                    order={6}
                  >
                    # {c.name}
                  </Text>
                </Link>
              ))}
            </Paper>
          </Group>
        </Navbar>
      }
      header={
        <Header
          sx={(theme) => ({
            backgroundColor: '#1B194E',
          })}
          height={76}
          padding="lg"
        >
          <Link href={'/'} passHref>
            <Title
              sx={(theme) => ({
                color: 'white',
                cursor: 'pointer',
              })}
              order={2}
            >
              Linen
            </Title>
          </Link>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor: '#fef9f5',
          paddingRight: 20,
          paddingBottom: 20,
        },
      })}
    >
      <SEO {...seo} />
      {children}
    </AppShell>
  );
}

export default PageLayout;
