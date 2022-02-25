import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import {
  fetchMessage,
  listUsers,
  saveUsers,
} from '../../fetch_all_conversations';
import {
  findAccountById,
  findChannel,
  findOrCreateUser,
} from '../../lib/slack';
import { saveMessagesSyncronous } from './createOrUpdateMessages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const channelId = req.query.channel_id as string;
  const account = await findAccountById(accountId);
  const slackChannel = await findChannel(channelId);

  const messages = await prisma.messages.findMany({
    where: {
      usersId: null,
      channelId: channelId,
      NOT: {
        slackMessageId: null,
      },
    },
    orderBy: {
      slackMessageId: 'desc',
    },
  });

  for (let i = 0; i < messages.length - 1; i++) {
    try {
      const m = messages[i];
      const foundMesssage = await fetchMessage(
        slackChannel.slackChannelId,
        account.slackAuthorizations[0].accessToken,
        m.slackMessageId
      );
      const message = foundMesssage.body.messages[0];
      const user = await prisma.users.findUnique({
        where: {
          slackUserId: message.user,
        },
      });

      await prisma.messages.update({
        where: {
          id: m.id,
        },
        data: {
          usersId: user.id,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  res.status(200).json('ok');
}
