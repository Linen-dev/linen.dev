import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@linen/database';
import Session from 'services/session';
import to from '@linen/utilities/await-to-js';
import { z } from 'zod';
import { serializeReadStatus } from '@linen/serializers/read-status';

async function put(request: NextApiRequest, response: NextApiResponse) {
  const user = await Session.auth(request, response);
  if (!user) {
    return response.status(401).json({});
  }

  const schema = z.object({
    channelId: z.string().min(1),
    timestamp: z.number(),
  });

  const params = { ...request.query, ...request.body };

  const [badRequest, body] = await to(schema.parseAsync(params));
  if (badRequest) {
    return response.status(400).json({ error: badRequest.message });
  }

  const { channelId } = body;
  const authId = user.id;
  const timestamp = BigInt(body.timestamp);
  const data = { authId, channelId, lastReadAt: timestamp };

  const [err, status] = await to(
    prisma.readStatus.upsert({
      create: data,
      update: data,
      where: {
        authId_channelId: {
          authId,
          channelId,
        },
      },
      select: {
        channelId: true,
        lastReadAt: true,
        channel: {
          select: {
            threads: {
              orderBy: {
                sentAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    })
  );
  if (err) {
    console.error(err);
    return response.status(500).json({});
  }

  return response.status(200).json(serializeReadStatus(status));
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
  const [err, status] = await to(
    prisma.readStatus.findUnique({
      select: {
        channelId: true,
        lastReadAt: true,
        channel: {
          select: {
            threads: {
              orderBy: {
                sentAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
      where: {
        authId_channelId: {
          authId: user.id,
          channelId,
        },
      },
    })
  );
  if (err) {
    console.error(err);
    return response.status(500).json({});
  }
  return response.status(200).json(serializeReadStatus(status));
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
