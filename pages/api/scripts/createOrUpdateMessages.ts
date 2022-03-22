import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../client';
import { fetchConversations } from '../../../fetch_all_conversations';
import {
  channelIndex,
  findAccountById,
  findOrCreateThread,
} from '../../../lib/models';

// fetches all conversations with paginated results and saves the messages
// This happens after the slack channels have been created and joined

//SYNC ORDER:
// createOrUpdateMessages
// syncMessageThreads
// syncUsers
// syncUsersAndMessages
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accountId = req.query.account_id as string;
  const account = await findAccountById(accountId);
  const channels = await channelIndex(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  for (let i = 0; i < channels.length; i++) {
    const c = channels[i];
    const conversations = await fetchConversations(
      c.slackChannelId,
      account.slackAuthorizations[0].accessToken
    );
    const respBody = conversations.body;

    let nextCursor: string | null = respBody.response_metadata?.next_cursor;
    const messages = conversations.body.messages;

    //fetch all messages by paginating
    while (!!nextCursor) {
      try {
        const additionalConversations = await fetchConversations(
          c.slackChannelId,
          account.slackAuthorizations[0].accessToken,
          nextCursor
        );

        const additionaMessages = additionalConversations.body.messages;
        if (!!additionaMessages) {
          messages.push(...additionaMessages);
        }
        nextCursor =
          additionalConversations.body.response_metadata?.next_cursor;
      } catch (e) {
        console.log('fetching user failed', (e as Error).message);
        nextCursor = null;
      }
    }

    //save all messages
    await saveMessagesSyncronous(messages, c.id);
  }

  res.status(200).json('ok');
}

type MessageParam = {
  ts: string;
  text: string;
  thread_ts: string;
};

export async function saveMessagesSyncronous(
  messages: MessageParam[],
  channelId: string
) {
  for (let j = 0; j < messages.length - 1; j++) {
    const m = messages[j];
    let threadId: string | null;
    let thread: any | null;
    if (!!m.thread_ts) {
      thread = await findOrCreateThread({
        slackThreadTs: m.thread_ts,
        channelId: channelId,
      });
    }

    threadId = thread?.id;
    const text = m.text as string;
    await prisma.messages.upsert({
      where: {
        body_sentAt: {
          body: text,
          sentAt: new Date(parseFloat(m.ts) * 1000),
        },
      },
      update: {
        slackMessageId: m.ts as string,
        slackThreadId: threadId,
      },
      create: {
        body: m.text,
        sentAt: new Date(parseFloat(m.ts) * 1000),
        channelId,
        slackMessageId: m.ts as string,
        slackThreadId: threadId,
        usersId: null,
      },
    });
  }
}
