import { anonymizeUser } from 'utilities/anonymizeMessages';
import { NextApiRequest, NextApiResponse } from 'next/types';
import {
  messages,
  Prisma,
  mentions,
  threads,
  users,
  AccountType,
  prisma,
} from '@linen/database';
import PermissionsService from 'services/permissions';
import unique from 'lodash.uniq';
import { serializeUser } from '@linen/serializers/user';
import { SerializedUser } from '@linen/types';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.query as string;
  const accountId = req.query.account_id as string;
  const limit = req.query.limit as string;
  const offset = req.query.offset as string;

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

  const queryPromise = prisma.$queryRaw<messages[]>`SELECT m."id",
          m."createdAt",
          m."body",
          m."sentAt",
          m."channelId",
          m."externalMessageId",
          m."threadId",
          m."usersId",
          m."messageFormat",
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

  const messagesResult = await queryPromise;
  // Get messages threads
  const threadIds = messagesResult.map((mr) => mr.threadId);
  const threadsResult =
    threadIds.length > 0
      ? await prisma.$queryRaw<threads[]>`SELECT "public"."threads"."id",
          "public"."threads"."incrementId",
          "public"."threads"."externalThreadId",
          "public"."threads"."viewCount",
          "public"."threads"."slug",
          "public"."threads"."messageCount",
          "public"."threads"."channelId"
      FROM "public"."threads"
      WHERE "public"."threads"."id" IN (${Prisma.join(threadIds)})`
      : [];

  // Get mentions for the messages
  const messageIds = messagesResult.map((mr) => mr.id);
  const mentionsResult =
    messageIds.length > 0
      ? await prisma.$queryRaw<
          mentions[]
        >`SELECT "public"."mentions"."messagesId",
        "public"."mentions"."usersId"
    FROM "public"."mentions"
    WHERE "public"."mentions"."messagesId" IN (${Prisma.join(messageIds)})`
      : [];

  // Get users
  const userIds = unique([
    ...mentionsResult.map((mr) => mr.usersId),
    ...messagesResult.map((mr) => mr.usersId),
  ]);
  const usersResult =
    userIds.length > 0
      ? await prisma.$queryRaw<users[]>`SELECT "public"."users"."id",
        "public"."users"."externalUserId",
        "public"."users"."displayName",
        "public"."users"."profileImageUrl",
        "public"."users"."isBot",
        "public"."users"."isAdmin",
        "public"."users"."anonymousAlias",
        "public"."users"."accountsId"
    FROM "public"."users"
    WHERE "public"."users"."id" IN (${Prisma.join(userIds)})`.then((users) => {
          if (!!account?.anonymizeUsers) {
            return users.map((u) => anonymizeUser(u));
          }
          return users;
        })
      : [];

  // Map the results
  const searchResults = messagesResult.map((mr) => {
    const user = usersResult.find((user) => user.id === mr.usersId);
    return {
      ...mr,
      threads: threadsResult.find((str) => str.id === mr.threadId),
      user: user ? serializeUser(user) : null,
      mentions: mentionsResult.reduce((prev, curr) => {
        const users = usersResult.find((ur) => ur.id === curr.usersId);
        if (users) {
          return [...prev, serializeUser(users)];
        }
        return prev;
      }, [] as SerializedUser[]),
    };
  });

  // Below is the Prisma substitute of the obove series of queries
  // but Prisma is not using full-text GIS index, and it is extremely slow.
  // See also the issue: https://github.com/prisma/prisma/issues/8950

  // const response = await prisma.messages
  //   .findMany({
  //     where: {
  //       body: {
  //         search: searchQuery,
  //       },
  //       channel: {
  //         accountId: accountId,
  //       },
  //     },
  //     include: {
  //       threads: true,
  //       mentions: {
  //         include: {
  //           users: true,
  //         },
  //       },
  //       reactions: true,
  //       attachments: true,
  //     },
  //     take: 20,
  //   })
  //   .then((messages) => {
  //     if (!!account?.anonymizeUsers) {
  //       return anonymizeMessagesMentions(messages);
  //     } else {
  //       return messages;
  //     }
  //   });

  res.status(200).json(searchResults);
}

//generated by taking matches and passing it in to json to typescript
export interface Match {
  iid: string;
  team: string;
  score: number;
  channel: Channel;
  type: string;
  user: string;
  username: string;
  ts: string;
  blocks: Block[];
  text: string;
  permalink: string;
  no_reactions?: boolean;
  attachments?: Attachment[];
}

export interface Channel {
  id: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  name: string;
  is_shared: boolean;
  is_org_shared: boolean;
  is_ext_shared: boolean;
  is_private: boolean;
  is_mpim: boolean;
  pending_shared: any[];
  is_pending_ext_shared: boolean;
}

export interface Block {
  type: string;
  block_id: string;
  elements: Element[];
}

export interface Element {
  type: string;
  elements: Element2[];
  style?: string;
  indent?: number;
}

export interface Element2 {
  type: string;
  text?: string;
  range?: string;
  style?: Style;
  name?: string;
  elements?: Element3[];
  url?: string;
  user_id?: string;
}

export interface Style {
  code?: boolean;
  bold?: boolean;
}

export interface Element3 {
  type: string;
  text?: string;
  url?: string;
  style?: Style2;
  name?: string;
  user_id?: string;
}

export interface Style2 {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

export interface Attachment {
  text?: string;
  title: string;
  footer?: string;
  id: number;
  footer_icon?: string;
  ts?: number;
  color?: string;
  fields?: Field[];
  mrkdwn_in?: string[];
  fallback: string;
  bot_id?: string;
  app_unfurl_url?: string;
  is_app_unfurl?: boolean;
  app_id?: string;
  image_url?: string;
  image_width?: number;
  image_height?: number;
  image_bytes?: number;
  from_url?: string;
  service_name?: string;
  service_icon?: string;
  title_link?: string;
  original_url?: string;
}

export interface Field {
  title: string;
  value: string;
  short: boolean;
}

export default handler;
