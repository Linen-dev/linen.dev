import { Navbar, Group, Title, Text, Paper } from '@mantine/core';
import { channels } from '@prisma/client';
import Link from 'next/link';
import { CustomLink } from '../Link/Link';

export function NavBar(
  channels: any,
  channelName: string | string[],
  communityName: string,
  isSubDomainRouting: boolean
) {
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
            {channels.map((c: channels) => (
              <CustomLink
                isSubDomainRouting={isSubDomainRouting}
                communityName={communityName}
                key={c.channelName}
                path={`/c/${c.channelName}`}
                // href={`/s/${communityName}/c/${c.channelName}`}
                passHref
              >
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
              </CustomLink>
            ))}
          </div>
        </Paper>
      </Group>
    </Navbar>
  );
}
