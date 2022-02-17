import { prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next/types';
import {
  fetchConversations,
  joinChannel,
  listUsers,
  saveMessages,
  saveUsers,
} from '../../fetch_all_conversations';
import {
  channelIndex,
  createManyChannel,
  findOrCreateAccount,
} from '../../lib/slack';
import { getSlackChannels } from './slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const slackTeamId = 'T017CSH2R70';
  const slackTeamName = 'Papercups';
  const account = await findOrCreateAccount({
    slackTeamId,
    name: slackTeamName,
  });
  const channelsResponse = await getSlackChannels(slackTeamId);
  const channelsParam = channelsResponse.body.channels.map(
    (channel: { id: any; name: any }) => {
      return {
        slackChannelId: channel.id,
        channelName: channel.name,
        accountId: account.id,
      };
    }
  );

  const usersListResponse = await listUsers();
  const users = await saveUsers(usersListResponse.body.members, account.id);

  try {
    const createdChannel = await createManyChannel(channelsParam);
  } catch (e) {
    console.log(e);
  }
  const channels = await channelIndex(account.id);
  for (let channel of channels) {
    try {
      const joined = await joinChannel(channel.slackChannelId);
      const conversations = await fetchConversations(channel.slackChannelId);
      const messages = await saveMessages(
        conversations.body.messages,
        channel.id
      );
    } catch (e) {}
  }

  res.status(200).json({ channels });
}

export const syncChannel = () => {};
