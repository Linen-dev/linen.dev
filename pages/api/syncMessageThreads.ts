import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import {
  fetchReplies,
  saveThreadedMessages,
} from '../../fetch_all_conversations';
import {
  findAccountById,
  findMessagesWithThreads,
  findSlackThreadsWithOnlyOneMessage,
} from '../../lib/slack';
import { saveMessagesSyncronous } from './createOrUpdateMessages';

//gets thread messages after createOrUpdateMessages
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const account = await findAccountById(accountId);
  const token = account.slackAuthorizations[0].accessToken;

  const slackThreadsWithOneMessage = await findSlackThreadsWithOnlyOneMessage(
    account.channels.map((c) => c.id)
  );

  console.log({ num: slackThreadsWithOneMessage.length });

  for (let i = 0; i < slackThreadsWithOneMessage.length - 1; i++) {
    const m = slackThreadsWithOneMessage[i];
    const channel = account.channels.find((c) => c.id === m.channelId);
    const replies = await fetchReplies(
      m.slackThreadTs,
      channel.slackChannelId,
      token
    );

    const replyMessages = replies?.body;
    try {
      await saveMessagesSyncronous(replyMessages.messages, m.channelId);
    } catch (e) {
      console.log(e);
    }
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
