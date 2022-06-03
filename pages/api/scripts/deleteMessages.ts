import { NextApiRequest, NextApiResponse } from 'next';
import { findAccountByEmail, findUserMessages } from '@/lib/models';
import { getSession } from 'next-auth/react';
import prisma from '../../../client';
import { generateRandomWordSlug } from '@/utilities/randomWordSlugs';
import { now } from 'next-auth/client/_utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const accountId = req.query.account_id as string;
  const userId = req.query.user_id as string;

  if (!session) {
    // Not Signed in
    res.status(401);
  }

  const account = await findAccountByEmail(session?.user?.email);
  if (account && account.id === accountId) {
    res.status(403);
  }

  const messages = await findUserMessages(accountId, userId);

  const deletedAt = new Date();
  for (let message of messages) {
    let userUpdated = false;
    if (message.author && !userUpdated) {
      await prisma.users.update({
        data: {
          displayName: `deleted-user-${message.id.substring(0, 8)}`,
          profileImageUrl: null,
          deletedAt,
        },
        where: { id: message.author.id },
      });
      userUpdated = true;
    }

    await prisma.messages.update({
      data: {
        body: 'This message has been deleted',
        deletedAt,
      },
      where: { id: message.id },
    });
  }

  return res.status(200).json({});
}
