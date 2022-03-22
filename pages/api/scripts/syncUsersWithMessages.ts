import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import {
  fetchMessage,
  listUsers,
  saveUsers,
} from '../../../fetch_all_conversations';
import {
  findAccountById,
  findChannel,
  findOrCreateUser,
} from '../../../lib/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const account = await findAccountById(accountId);
  if (!account || !account.slackTeamId) {
    return res.status(404).json({ error: 'Account not found' });
  }
  const channels = account.channels;

  const messages = await prisma.messages.findMany({
    where: {
      usersId: null,
      channelId: {
        in: channels.map((c) => c.id),
      },
      NOT: [
        {
          slackMessageId: null,
        },
        {
          body: '',
        },
      ],
    },
    orderBy: {
      slackMessageId: 'desc',
    },
  });

  for (let i = 0; i < messages.length - 1; i++) {
    try {
      const m = messages[i];
      const channel = channels.find((c) => c.id === m.channelId);
      const foundMesssage = await fetchMessage(
        channel!.slackChannelId,
        account.slackAuthorizations[0].accessToken,
        m.slackMessageId!
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
          usersId: user!.id,
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  res.status(200).json('ok');
}
