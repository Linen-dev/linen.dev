import { DiscordChannel } from 'types/discord';
import DiscordApi from './api';
import to from 'utilities/await-to-js';
import ChannelsService from 'services/channels';
import Logger from './logger';

enum ChannelType {
  TEXT = 0,
  FORUM = 15,
}

export async function listChannelsAndPersist({
  serverId,
  accountId,
  token,
  logger,
}: {
  serverId: string;
  accountId: string;
  token: string;
  logger: Logger;
}) {
  logger.log('listChannelsAndPersist >> started');
  const [err, channels] = await to(
    DiscordApi.getDiscordChannels({ serverId, token })
  );
  if (err) {
    logger.error(`listChannelsAndPersist >> finished with error: ${err}`);
    return;
  }
  try {
    const channelPromises = await Promise.all(
      channels
        .filter((c) => [ChannelType.TEXT, ChannelType.FORUM].includes(c.type))
        .map((channel) =>
          ChannelsService.findOrCreateChannel(parseChannel(channel, accountId))
        )
    );
    return channelPromises;
  } catch (error) {
    logger.error(
      `listChannelsAndPersist >> finished with error: ${JSON.stringify(error)}`
    );
    return;
  } finally {
    logger.log('listChannelsAndPersist >> finished');
  }
}

function parseChannel(
  channel: DiscordChannel,
  accountId: string
): {
  accountId: string;
  channelName: string;
  externalChannelId: string;
  hidden?: boolean | undefined;
} {
  return {
    externalChannelId: channel.id,
    channelName: channel.name,
    accountId,
    hidden: isPrivate(channel),
  };
}

function isPrivate(channel: DiscordChannel): boolean {
  if (channel.nsfw) {
    return true;
  }
  // we assume that if there any permission it is a private channel
  // customer should toggle it on settings page if want to make it public
  if (channel.permission_overwrites && channel.permission_overwrites.length) {
    return true;
  }
  return false;
}
