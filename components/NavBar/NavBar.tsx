import { Navbar, Group, Title, Text, Paper } from '@mantine/core';
import Link from 'next/link';

export function NavBar(channels: any, channelName: string | string[]) {
  return (
    <Navbar
      sx={(theme) => ({ backgroundColor: 'white', zIndex: 1 })}
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
              <Link key={c.channelName} href={`/c/${c.channelName}`} passHref>
                <Text
                  className="hover:bg-gray-50 px-4 py-2"
                  size="sm"
                  weight={channelName === c.channelName ? 700 : 500}
                  sx={(theme) => ({
                    cursor: 'pointer',
                    width: '100%',
                    backgroundColor: 'white',
                    color: channelName === c.channelName ? '#1B194E' : 'black',
                    borderLeft: `3px solid ${
                      channelName === c.channelName ? '#1B194E' : 'transparent'
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
  );
}
