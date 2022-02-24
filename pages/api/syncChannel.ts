import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import {
  fetchAndSaveThreadMessages,
  fetchReplies,
  saveThreadedMessages,
} from '../../fetch_all_conversations';
import { findAccountById, findChannel, threadIndex } from '../../lib/slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const channelId = req.query.channelId as string;
  const messages = await fetchChannelThreads(channelId);
  res.status(200).json({ messages });
}

const fetchChannelThreads = async (channelId: string) => {
  const channel = await findChannel(channelId);
  const account = await findAccountById(channel.accountId);
  const slackAuthorization = account.slackAuthorizations[0];

  const messages = await prisma.messages.findMany({
    where: { NOT: [{ slackThreadId: null }], channelId: channelId },
    include: {
      slackThreads: true,
      channel: true,
    },
    orderBy: {
      sentAt: 'desc',
    },
  });

  const messagesWithThreads = [];

  for (let i = 0; i < messages.length; i++) {
    try {
      const result = await fetchReplies(
        messages[i].slackThreads.slackThreadTs,
        messages[i].channel.slackChannelId,
        slackAuthorization.accessToken
      ).then((response) => {
        if (!!response?.body && messages[i].slackThreads?.slackThreadTs) {
          const replyMessages = response?.body;
          return saveThreadedMessages(
            replyMessages,
            channel.id,
            messages[i].slackThreads.slackThreadTs
          );
        }
      });
      messagesWithThreads.push(result);
    } catch (e) {
      console.error('Failed to fetch message threads: ', e.message);
    }
  }

  return messagesWithThreads;
};
