import { Navbar, Group, Title, Text, Paper, NativeSelect } from '@mantine/core';
import { channels } from '@prisma/client';
import CustomLink from '../Link/CustomLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import CustomRouterPush from '../Link/CustomRouterPush';
import { useEffect, useState } from 'react';

export function NavBar(
  channels: channels[],
  channelName: string | string[],
  communityName: string,
  isSubDomainRouting: boolean
) {
  const [channel, setChannel] = useState(channelName);

  useEffect(() => {
    console.log('channel', channel);
    if (channel && channel !== channelName) {
      CustomRouterPush({
        isSubDomainRouting: isSubDomainRouting,
        communityName: communityName,
        path: `/c/${channel}/1`,
      });
    }
  }, [channel, channelName, communityName, isSubDomainRouting]);

  const navBarLg = (
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
                path={`/c/${c.channelName}/1`}
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
          <a
            className="pl-4 text-gray-800 opacity-80 text-sm hover:text-blue-900"
            target="_blank"
            href="https://www.linen.dev"
          >
            Powered by Linen
          </a>
        </Paper>
      </Group>
    </Navbar>
  );

  const navBarSm = (
    <div className="pt-4 px-10">
      <NativeSelect
        data={channels.map((c: channels) => c.channelName)}
        icon={<FontAwesomeIcon icon={faHashtag} size="xs" />}
        onChange={(event) => setChannel(event.currentTarget.value)}
        description="Channels"
        radius="sm"
        size="xs"
        value={channel}
      />
    </div>
  );

  return (
    <>
      <div className="hidden md:flex">{navBarLg}</div>
      <div className="md:hidden">{navBarSm}</div>
    </>
  );
}
