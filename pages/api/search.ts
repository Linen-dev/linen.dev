import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import { slackSearch } from './slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = req.query.query as string;
  const accountId = req.query.account_id as string;

  const account = await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
    include: {
      channels: {
        select: {
          channelName: true,
        },
        where: {
          hidden: false,
        },
      },
      slackAuthorizations: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (
    account === null ||
    account === undefined ||
    account.slackAuthorizations.length === 0
  ) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  const auth = account.slackAuthorizations[0];

  if (!!auth.userAccessToken) {
    const channels = account.channels;
    const channelNames = channels
      .map((c) => {
        // filter out non ascii characters like: 个人
        // incase the channel names are non ascii characters
        // slack api will error out... probably better to escape then remove it
        const cleanName = c.channelName.replace(/[^\x00-\x7F]/g, '');
        if (cleanName === '') {
          return '';
        }
        return 'in:' + cleanName;
      })
      .join(' ');

    const searchQuery = `${query} ${channelNames}`;

    //This is limited to 20 search per minute per workspace
    //Use pg search if slack search hits rate limit or fails
    //Eventually the plan is to host Elastic search
    const result = await slackSearch({
      query: searchQuery,
      token: auth.userAccessToken,
    });
    const slackfoundMessages = result?.messages || [];
    const matches: Match[] = slackfoundMessages.matches.filter((m) => {
      // removes dm messages
      return !m.channel.is_im;
    });

    const ts = matches.map((m) => m.ts);

    const matchedMessages = await prisma.messages.findMany({
      where: {
        slackMessageId: { in: ts },
      },
      include: {
        slackThreads: true,
      },
    });

    const sortedMatches = matchedMessages.sort((a, b) => {
      const matchA = matches.find((m) => m.ts === a.slackMessageId);
      const matchB = matches.find((m) => m.ts === b.slackMessageId);
      // matches will existing since it is based on find many where slack Message id
      return matchB!.score - matchA!.score;
    });

    if (slackfoundMessages.matches.length === 0) {
      const messages = await prisma.messages.findMany({
        where: {
          body: {
            search: query.split(' ').join(' & '),
          },
          channel: {
            accountId: accountId,
          },
        },
        include: {
          slackThreads: true,
        },
        take: 20,
      });
      sortedMatches.push(...messages);
    }

    res.status(200).json({ results: sortedMatches });
    return;
  }

  const response = await prisma.messages.findMany({
    where: {
      body: {
        search: query.split(' ').join(' & '),
      },
      channel: {
        accountId: accountId,
      },
    },
    take: 20,
  });

  res.status(200).json({ results: response });
}

//example get query:
//localhost:3000/api/search?query='papercups'

//example response:
// {
//     "results": [
//         {
//             "id": "00b8ebe2-978f-43e6-9ba2-8b3474eafcbe",
//             "createdAt": "2022-02-19T21:33:51.731Z",
//             "body": "that’s awesome :smile: Cant wait to flex my papercups swag :sunglasses:",
//             "sentAt": "2021-03-16T21:41:32.004Z",
//             "channelId": "c550828a-36bc-4e8d-9f45-84d7339bf884",
//             "slackThreadId": "6f4511f5-a449-4420-ab64-75801f1e1640",
//             "usersId": "e3e56a3e-1b39-420b-8455-8f32775a0c19"
//         },
//         {
//             "id": "04aaf56d-9519-4dcd-8fb7-c70555711a1c",
//             "createdAt": "2022-02-19T21:33:43.608Z",
//             "body": "I have a little question about papercups integration on a wordpress website :\nwe did manage to integrate it on our website <https://hidora.io/> but the icon is way too big, any idea of what could cause that ?",
//             "sentAt": "2022-01-18T12:58:49.001Z",
//             "channelId": "af505043-21fb-4810-b3cc-f82a3ef76046",
//             "slackThreadId": "4a469b00-027c-4719-a7d8-27890989a899",
//             "usersId": "e17f6a01-f8e4-4467-9e31-d12a09907aa2"
//         },
//     ]
// }

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
