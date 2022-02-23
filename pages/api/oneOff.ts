import { NextApiRequest, NextApiResponse } from 'next/types';
import {
  fetchAndSaveThreadMessages,
  fetchConversations,
  fetchTeamInfo,
  joinChannel,
  listUsers,
  saveMessages,
  saveUsers,
} from '../../fetch_all_conversations';
import {
  channelIndex,
  createManyChannel,
  findAccountById,
  findMessagesWithThreads,
  updateAccountRedirectDomain,
} from '../../lib/slack';
import { getSlackChannels } from './slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const domain = req.query.domain as string;

  const account = await findAccountById(accountId);
  //TODO test multiple slack authorization or reauthorization
  const token = account.slackAuthorizations[0].accessToken;

  const teamInfoResponse = await fetchTeamInfo(token);
  const slackUrl = teamInfoResponse.body.team.url;

  if (!!domain && !!slackUrl) {
    await updateAccountRedirectDomain(accountId, domain, slackUrl);
  }

  const messageWithThreads = await fetchAllMessages(
    account.slackTeamId,
    account.slackAuthorizations[0].accessToken,
    accountId
  );

  res.status(200).json({ messageWithThreads });
}

export async function fetchAllMessages(
  slackTeamId: string,
  token: string,
  accountId: string
) {
  const channelsResponse = await getSlackChannels(slackTeamId, token);
  console.log({ channelResponse: channelsResponse.body });
  const channelsParam = channelsResponse.body.channels.map(
    (channel: { id: any; name: any }) => {
      return {
        slackChannelId: channel.id,
        channelName: channel.name,
        accountId,
      };
    }
  );

  const usersListResponse = await listUsers(token);
  const users = await saveUsers(usersListResponse.body.members, accountId);

  try {
    const createdChannel = await createManyChannel(channelsParam);
  } catch (e) {
    console.log(e);
  }
  const channels = await channelIndex(accountId);
  let messages: any;
  for (let channel of channels) {
    try {
      const joined = await joinChannel(channel.slackChannelId, token);
      const conversations = await fetchConversations(
        channel.slackChannelId,
        token
      );

      messages = await saveMessages(
        conversations.body.messages,
        channel.id,
        channel.slackChannelId
      );
    } catch (e) {}
  }

  const messageWithThreads = await findMessagesWithThreads();
  console.log({ messageWithThreads });
  await fetchAndSaveThreadMessages(messageWithThreads, token);
  return messageWithThreads;
}
