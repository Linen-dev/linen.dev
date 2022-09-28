import { NextApiRequest, NextApiResponse } from 'next/types';
import { withSentry } from '@sentry/nextjs';
import { findMessageById } from 'lib/messages';
import serialize from 'serializers/message';
import { getAuthFromSession } from 'utilities/session';
import to from 'utilities/await-to-js';

async function get(request: NextApiRequest, response: NextApiResponse) {
  const id = request.query.id as string;
  const [sessionErr, session] = await to(getAuthFromSession(request, response));
  if (!!sessionErr || !session) {
    return response.status(401).end();
  }
  const message = await findMessageById({ id });
  if (!message) {
    return response.status(404).end();
  }
  const permission = session.tenants.find(
    (u) => u.accountId === message.channel.accountId
  );
  if (!permission) {
    return response.status(403).end();
  }
  return response.status(200).json(serialize(message));
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method === 'GET') {
    return get(request, response);
  }
  return response.status(405).end();
}

export default withSentry(handler);
