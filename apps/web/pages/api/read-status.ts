import { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';
import { getReadStatus, updateReadStatus } from 'services/users/read-status';
import to from 'utilities/await-to-js';
import { z } from 'zod';

async function post(request: NextApiRequest, response: NextApiResponse) {
  // identify user
  const user = await Session.auth(request, response);
  if (!user) {
    return response.status(401).end();
  }

  // validate input
  const schema = z.object({
    channelId: z.string().min(1),
    timestamp: z.number(),
  });
  const [badRequest, body] = await to(schema.parseAsync(request.body));
  if (badRequest) {
    return response.status(400).send(badRequest.message);
  }

  // call service
  const [err, _] = await to(
    updateReadStatus({
      channelId: body.channelId,
      authId: user.id,
      timestamp: BigInt(body.timestamp),
    })
  );
  if (err) {
    console.error(err);
    return response.status(500).end();
  }

  return response.status(200).end();
}

async function get(request: NextApiRequest, response: NextApiResponse) {
  // identify user
  const user = await Session.auth(request, response);
  if (!user) {
    return response.status(401).end();
  }

  // validate input
  const schema = z.object({
    channelId: z.string().min(1),
  });
  const [badRequest, body] = await to(schema.parseAsync(request.query));
  if (badRequest) {
    return response.status(400).end(badRequest);
  }

  // call service
  const { channelId } = body;
  const [err, data] = await to(getReadStatus({ authId: user.id, channelId }));
  if (err) {
    console.error(err);
    return response.status(500).end();
  }

  return response.status(200).json(data);
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return await post(request, response);
  }
  if (request.method === 'GET') {
    return await get(request, response);
  }
  return response.status(405).end();
}
