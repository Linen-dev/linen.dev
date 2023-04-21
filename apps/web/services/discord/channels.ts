import { DiscordChannel } from '@linen/types';
import DiscordApi from './api';
import to from '@linen/utilities/await-to-js';
import ChannelsService from 'services/channels';
import Logger from './logger';
import { slugify } from '@linen/utilities/string';
import { channels } from '@linen/database';

enum ChannelType {
  TEXT = 0,
  FORUM = 15,
}

export async function listChannelsAndPersist({
  serverId,
  accountId,
  token,
  logger,
  hideChannels,
}: {
  serverId: string;
  accountId: string;
  token: string;
  logger: Logger;
  hideChannels: boolean;
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
    const channelPromises: channels[] = [];
    const filteredChannels = channels.filter((c) =>
      [ChannelType.TEXT, ChannelType.FORUM].includes(c.type)
    );
    for (const channel of filteredChannels) {
      try {
        const newChannel = await ChannelsService.findOrCreateChannel(
          parseChannel({ channel, accountId, hidden: hideChannels })
        );
        channelPromises.push(newChannel);
      } catch (error) {
        logger.error(
          `listChannelsAndPersist >> failure: ${JSON.stringify({
            error,
            channel,
          })}`
        );
      }
    }

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

function parseChannel({
  channel,
  accountId,
  hidden,
}: {
  channel: DiscordChannel;
  accountId: string;
  hidden: boolean;
}) {
  return {
    externalChannelId: channel.id,
    channelName: slugify(channel.name),
    accountId,
    hidden,
  };
}
