import { NextApiRequest, NextApiResponse } from 'next';
import { anonymizeUsersFromAccount } from '../../../services/anonymize';
import { withSentry } from '@sentry/nextjs';

async function handler(request: NextApiRequest, response: NextApiResponse) {
  const accountId = request.query.account_id as string;
  await anonymizeUsersFromAccount(accountId);
  return response.status(200).json({});
}

export default withSentry(handler);
