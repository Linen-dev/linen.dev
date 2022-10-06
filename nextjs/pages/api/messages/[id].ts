import { NextApiRequest, NextApiResponse } from 'next/types';
import { withSentry } from '@sentry/nextjs';
import { findMessageById } from 'lib/messages';
import serializeMessage from 'serializers/message';
import { getAuthFromSession } from 'utilities/session';

async function get(request: NextApiRequest, response: NextApiResponse) {
  const id = request.query.id as string;
  const user = await getAuthFromSession(request, response);
  if (!user) {
    return response.status(401).end();
  }
  const message = await findMessageById({ id });
  if (!message) {
    return response.status(404).end();
  }
  const permission = user.tenants.find(
    (u) => u.accountId === message.channel.accountId
  );
  if (!permission) {
    return response.status(403).end();
  }
  return response.status(200).json(serializeMessage(message));
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'GET') {
    return get(request, response);
  }
  return response.status(405).end();
}

export default withSentry(handler);
