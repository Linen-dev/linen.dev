import { AccountWithSlackAuthAndChannels } from 'types/partialTypes';
import { sleep } from 'utilities/retryPromises';
import ChannelsService from 'services/channels';

export async function createChannels({
  slackTeamId,
  token,
  accountId,
  getSlackChannels,
  joinChannel,
  hideChannels,
}: {
  slackTeamId: string;
  token: string;
  accountId: string;
  getSlackChannels: Function;
  joinChannel: Function;
  hideChannels: boolean;
}) {
  try {
    const channelsResponse = await getSlackChannels(slackTeamId, token);
    const channels = await Promise.all(
      channelsResponse.body.channels.map(
        (channel: { id: string; name: string }) =>
          ChannelsService.findOrCreateChannel({
            externalChannelId: channel.id,
            channelName: channel.name,
            accountId,
            hidden: hideChannels,
          })
      )
    );

    console.log('Joining channels started');
    let sleeping = sleep(60 * 1000);
    let counter = 0;
    const filteredChannels = channels.filter(
      (c) => c.externalPageCursor !== 'completed'
    );

    for (let channel of filteredChannels) {
      counter++;
      await joinChannel(channel.externalChannelId, token);
      // Slack's api can handle bursts
      // so only wait for requests if there are more than 50 messages
      if (counter >= 50) {
        await sleeping;
        counter = 0;
        sleeping = sleep(60 * 1000);
      }
    }
    console.log('Joining channels ended');

    return channels;
  } catch (e) {
    console.error('Error creating Channels:', e);
    return [];
  }
}

export async function syncChannels({
  account,
  token,
  accountId,
  channelId,
  getSlackChannels,
  joinChannel,
}: {
  account: AccountWithSlackAuthAndChannels;
  token: string;
  accountId: string;
  channelId?: string;
  getSlackChannels: Function;
  joinChannel: Function;
}) {
  let channels = await createChannels({
    slackTeamId: account.slackTeamId as string,
    token,
    accountId,
    getSlackChannels,
    joinChannel,
    hideChannels: account.newChannelsConfig === 'HIDDEN',
  });

  // If channelId is part of parameter only sync the specific channel
  if (!!channelId) {
    const channel = channels.find((c) => c.id === channelId);
    if (!!channel) {
      channels = [channel];
    }
  }
  return channels;
}
