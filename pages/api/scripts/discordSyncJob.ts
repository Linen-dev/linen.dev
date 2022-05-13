import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../client';
import request from 'superagent';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const discordAccounts = await prisma.accounts.findMany({
    select: { id: true },
    where: { discordServerId: { not: null } },
  });
  console.log({ discordAccounts });

  discordAccounts.map((account) =>
    request
      .get(
        process.env.SYNC_URL +
          '/api/scripts/discordSync?account_id=' +
          account.id
      )
      .then(() => {
        console.log('Syncing done!', account);
      })
      .catch((err) => {
        console.error('Syncing error: ', err, account);
      })
  );

  return res.status(200).json({});
}
