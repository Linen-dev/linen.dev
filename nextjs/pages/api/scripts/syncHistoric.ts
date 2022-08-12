import { NextApiRequest, NextApiResponse } from 'next/types';
import { slackSync } from '../../../services/slack';
import { discordSync } from '../../../services/discord/sync';
import { prisma } from '../../../client';
import {
  accounts,
  slackAuthorizations,
  discordAuthorizations,
} from '@prisma/client';
import { captureExceptionAndFlush, withSentry } from 'utilities/sentry';

function identifySyncType(
  account:
    | (accounts & {
        slackAuthorizations: slackAuthorizations[];
        discordAuthorizations: discordAuthorizations[];
      })
    | null
) {
  if (account?.discordAuthorizations.length) {
    return discordSync;
  }
  if (account?.slackAuthorizations.length) {
    return slackSync;
  }
  throw 'authorization missing';
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accountId = req.query.account_id as string;
  const account = await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
    include: {
      discordAuthorizations: true,
      slackAuthorizations: true,
    },
  });

  const sync = identifySyncType(account);

  try {
    sync({
      accountId,
      fullSync: true, // discord only
    });
    res.setHeader('Cache-Control', 'max-age=60');
    res.status(200).json({});
  } catch (error) {
    await captureExceptionAndFlush(error);
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

export default withSentry(handler);
