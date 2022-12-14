import { NextApiRequest, NextApiResponse } from 'next';
import Session from 'services/session';
import to from 'utilities/await-to-js';
import { z } from 'zod';
import { prisma } from 'client';

async function post(request: NextApiRequest, response: NextApiResponse) {
  const user = await Session.auth(request, response);
  if (!user) {
    return response.status(401).json({});
  }

  const schema = z.object({
    channelIds: z.string().array().min(1)
  });
  const [badRequest, body] = await to(schema.parseAsync(request.body));
  if (badRequest) {
    return response.status(400).json({ error: badRequest.message });
  }

  const [err, readStatuses] = await to(prisma.$transaction(
    body.channelIds.map((channelId: string) => {
      const data = {
        authId: user.id,
        channelId,
        lastReadAt: BigInt(new Date().getTime())
      };
      return prisma.readStatus.upsert({
        create: data,
        update: data,
        where: {
          authId_channelId: {
            authId: user.id,
            channelId,
          },
        },
      });
    })
  ))

  if (err) {
    console.error(err);
    return response.status(500).json({});
  }

  return response.status(200).json({ readStatuses });
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    return await post(request, response);
  }
  return response.status(405).end();
}
