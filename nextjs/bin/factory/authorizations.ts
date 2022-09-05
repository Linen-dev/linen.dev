import { accounts } from '@prisma/client';
import prisma from '../../client';

export const createAuthorizations = async (account: accounts) => {
  await prisma.slackAuthorizations.create({
    data: {
      accountsId: account.id,
      accessToken: '1234',
      botUserId: '5678',
      scope: 'unknown',
    },
  });
};
