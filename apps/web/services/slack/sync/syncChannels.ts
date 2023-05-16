import { AccountWithSlackAuthAndChannels } from '@linen/types';
import { sleep } from '@linen/utilities/promises';
import ChannelsService from 'services/channels';
import { GetSlackChannelsFnType, JoinChannelFnType } from '../types';

export async function createChannels({
  slackTeamId,
  token,
  accountId,
  getSlackChannels,
  joinChannel,
  hideChannels,
  shouldJoinChannel,
}: {
  slackTeamId: string;
  token: string;
  accountId: string;
  getSlackChannels: GetSlackChannelsFnType;
  joinChannel: JoinChannelFnType;
  hideChannels: boolean;
  shouldJoinChannel: boolean;
}) {
  try {
    const channelsResponse = await getSlackChannels(slackTeamId, token);
    if (!channelsResponse.body?.channels) {
      return [];
    }
    const channels = await Promise.all(
      channelsResponse.body.channels.map((channel) =>
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
      if (shouldJoinChannel && channel.externalChannelId) {
        await joinChannel(channel.externalChannelId, token);
      }
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
  shouldJoinChannel,
}: {
  account: AccountWithSlackAuthAndChannels;
  token: string;
  accountId: string;
  channelId?: string;
  getSlackChannels: GetSlackChannelsFnType;
  joinChannel: JoinChannelFnType;
  shouldJoinChannel: boolean;
}) {
  let channels = await createChannels({
    slackTeamId: account.slackTeamId as string,
    token,
    accountId,
    getSlackChannels,
    joinChannel,
    hideChannels: account.newChannelsConfig === 'HIDDEN',
    shouldJoinChannel,
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
