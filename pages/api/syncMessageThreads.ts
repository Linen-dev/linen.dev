import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import {
  fetchReplies,
  saveThreadedMessages,
} from '../../fetch_all_conversations';
import { findAccountById, findMessagesWithThreads } from '../../lib/slack';
import { saveMessagesSyncronous } from './createOrUpdateMessages';

//gets thread messages after createOrUpdateMessages
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const account = await findAccountById(accountId);
  console.log({ account });

  const messageWithThreads = await findMessagesWithThreads(account.id);
  const token = account.slackAuthorizations[0].accessToken;

  for (let i = 0; i < messageWithThreads.length - 1; i++) {
    console.log(i);
    const m = messageWithThreads[i];
    const replies = await fetchReplies(
      m.slackThreads.slackThreadTs,
      m.channel.slackChannelId,
      token
    );

    const replyMessages = replies?.body;
    await saveMessagesSyncronous(replyMessages.messages, m.channelId);
  }
  res.status(200).json('ok');
}

// export async function fetchAndSaveThreadMessages(
//   messages: (messages & {
//     channel: channels;
//     slackThreads: slackThreads | null;
//   })[],
//   token: string
// ) {
//   const repliesPromises = messages.map((m) => {
//     if (!!m.slackThreads?.slackThreadTs) {
//       return fetchReplies(
//         m.slackThreads.slackThreadTs,
//         m.channel.slackChannelId,
//         token
//       ).then((response) => {
//         if (!!response?.body && m.slackThreads?.slackThreadTs) {
//           const replyMessages = response?.body;
//           return saveThreadedMessages(
//             replyMessages,
//             m.channel.id,
//             m.slackThreads.slackThreadTs
//           );
//         }
//       });
//     }
//     return null;
//   });

//   return await Promise.all(repliesPromises);
// }
