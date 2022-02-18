import { prisma } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next/types';
import {
  fetchAndSaveThreadMessages,
  fetchConversations,
  joinChannel,
  listUsers,
  saveMessages,
  saveUsers,
} from '../../fetch_all_conversations';
import {
  channelIndex,
  createManyChannel,
  findMessagesWithThreads,
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
  let messages: any;
  for (let channel of channels) {
    try {
      const joined = await joinChannel(channel.slackChannelId);
      const conversations = await fetchConversations(channel.slackChannelId);

      messages = await saveMessages(
        conversations.body.messages,
        channel.id,
        channel.slackChannelId
      );
    } catch (e) {}
  }

  const messageWithThreads = await findMessagesWithThreads();
  console.log({ messageWithThreads });
  await fetchAndSaveThreadMessages(messageWithThreads);

  res.status(200).json({ messageWithThreads });
}

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const messageWithThreads = await findMessagesWithThreads();
//   await fetchAndSaveThreadMessages(messageWithThreads);

//   res.status(200).json({ messageWithThreads });
// }

export const syncChannel = () => {};
