import { Group, Title, Text, Paper, NativeSelect } from '@mantine/core';
import { channels } from '@prisma/client';
import ChannelName from './ChannelName';
import CustomLink from '../Link/CustomLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import CustomRouterPush from '../Link/CustomRouterPush';
import styles from './index.module.css';
import { sortByChannelName } from './utilities';

export default function NavBar({
  channelName,
  channels,
  communityName,
  communityType,
  isSubDomainRouting,
}: {
  channels: channels[];
  channelName: string | string[];
  communityName: string;
  communityType: string;
  isSubDomainRouting: boolean;
}) {
  const onChangeChannel = (channelSelected: string) => {
    if (channelName && channelName !== channelSelected) {
      CustomRouterPush({
        isSubDomainRouting: isSubDomainRouting,
        communityName,
        communityType,
        path: `/c/${channelSelected}/1`,
      });
    }
  };

  const sortedChannels = sortByChannelName(channels);

  const navBarLg = (
    <div className={styles.navbar}>
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
            {sortedChannels.map((c: channels) => (
              <CustomLink
                isSubDomainRouting={isSubDomainRouting}
                communityName={communityName}
                communityType={communityType}
                key={c.channelName}
                path={`/c/${c.channelName}/1`}
                passHref
              >
                <ChannelName
                  name={c.channelName}
                  active={c.channelName === channelName}
                />
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
    </div>
  );

  const navBarSm = (
    <div className="pt-4 px-6">
      <NativeSelect
        data={sortedChannels.map((c: channels) => c.channelName)}
        icon={<FontAwesomeIcon icon={faHashtag} size="xs" />}
        onChange={(event) => onChangeChannel(event.currentTarget.value)}
        description="Channels"
        radius="sm"
        size="xs"
        value={channelName}
      />
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex">{navBarLg}</div>
      <div className="lg:hidden h-16">{navBarSm}</div>
    </>
  );
}
