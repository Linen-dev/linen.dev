import { anonymizeSerializedMessages } from 'utilities/anonymizeMessages';
import type { NextApiRequest, NextApiResponse } from 'next/types';
import { AccountType, prisma } from '@linen/database';
import PermissionsService from 'services/permissions';
import { cors, preflight } from 'utilities/cors';
import { serializeSearchedMessage } from '@linen/serializers/message';
import { z } from 'zod';

const schema = z.object({
  query: z.string().min(1),
  accountId: z.string().uuid(),
  limit: z.coerce.number().min(1),
  offset: z.coerce.number().min(1).optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    return preflight(req, res, ['GET']);
  }
  cors(req, res);

  const parsed = schema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).send(JSON.stringify(parsed.error));
  }

  const { query, accountId, limit, offset = 0 } = parsed.data;

  const account = await prisma.accounts.findUnique({
    where: { id: accountId },
    select: { anonymizeUsers: true, type: true },
  });

  if (!account) {
    return res.status(404).json({});
  }
  if (account.type === AccountType.PRIVATE) {
    const permissions = await PermissionsService.get({
      request: req,
      response: res,
      params: {
        communityId: accountId,
      },
    });

    if (!permissions.access) {
      return res.status(403).json({});
    }
  }

  // Search messages
  const messagesResult = await prisma.$queryRaw<{ id: string }[]>`SELECT m."id",
          ts_rank(textsearchable_index_col,websearch_to_tsquery('english', ${query}))  AS rank
      FROM "public"."messages" as m
      INNER JOIN "public"."channels" AS c ON (c."id") = (m."channelId")
      WHERE 
          c."accountId" = ${accountId} 
          AND m."id" IS NOT NULL
          and m."threadId" is not null
          and c.hidden is false
          and c.type = 'PUBLIC'
          AND textsearchable_index_col @@ websearch_to_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number(offset)}`;

  const response = await prisma.messages
    .findMany({
      where: {
        id: { in: messagesResult.map((m) => m.id) },
      },
      include: {
        author: true,
        threads: true,
        mentions: {
          include: {
            users: true,
          },
        },
        reactions: true,
        attachments: true,
      },
    })
    .then((messages) => messages.map(serializeSearchedMessage))
    .then((messages) => {
      if (!!account?.anonymizeUsers) {
        return anonymizeSerializedMessages(messages);
      } else {
        return messages;
      }
    });

  res.status(200).json(response);
}

export default handler;
