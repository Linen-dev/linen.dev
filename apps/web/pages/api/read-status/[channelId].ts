import { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';
import { getReadStatus, updateReadStatus } from 'services/users/read-status';
import to from 'utilities/await-to-js';
import { z } from 'zod';
import serializeReadStatus from 'serializers/read-status'

async function put(request: NextApiRequest, response: NextApiResponse) {
  const user = await Session.auth(request, response);
  if (!user) {
    return response.status(401).json({});
  }

  const schema = z.object({
    channelId: z.string().min(1),
    timestamp: z.number(),
  });

  const params = { ...request.query, ...request.body }

  const [badRequest, body] = await to(schema.parseAsync(params));
  if (badRequest) {
    return response.status(400).json({ error: badRequest.message });
  }

  const [err, _] = await to(
    updateReadStatus({
      channelId: body.channelId,
      authId: user.id,
      timestamp: BigInt(body.timestamp),
    })
  );
  if (err) {
    console.error(err);
    return response.status(500).json({});
  }

  return response.status(200).json({});
}

async function get(request: NextApiRequest, response: NextApiResponse) {
  const user = await Session.auth(request, response);
  if (!user) {
    return response.status(401).json({});
  }

  const schema = z.object({
    channelId: z.string().min(1),
  });
  const [badRequest, body] = await to(schema.parseAsync(request.query));
  if (badRequest) {
    return response.status(400).json({ error: badRequest.message });
  }

  const { channelId } = body;
  const [err, data] = await to(getReadStatus({ authId: user.id, channelId }));
  if (err) {
    console.error(err);
    return response.status(500).json({});
  }
  return response.status(200).json(serializeReadStatus(data));
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'PUT') {
    return await put(request, response);
  }
  if (request.method === 'GET') {
    return await get(request, response);
  }
  return response.status(405).end();
}
