import { NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../client';
import {
  ConvesrationHistoryMessage,
  fetchAndSaveThreadMessages,
  fetchConversations,
  fetchConversationsTyped,
  fetchReplies,
  fetchTeamInfo,
  joinChannel,
  listUsers,
  saveMessages,
  saveUsers,
} from '../../fetch_all_conversations';
import {
  channelIndex,
  createManyChannel,
  findAccountById,
  findMessagesWithThreads,
  findOrCreateThread,
  findSlackThreadsWithOnlyOneMessage,
  updateAccountRedirectDomain,
} from '../../lib/slack';
import { getSlackChannels } from './slack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(new Date());
  const accountId = req.query.account_id as string;
  const channelId = req.query.channel_id as string;
  const domain = req.query.domain as string;

  const account = await findAccountById(accountId);
  //TODO test multiple slack authorization or reauthorization
  const token = account.slackAuthorizations[0].accessToken;

  const teamInfoResponse = await fetchTeamInfo(token);
  const slackUrl = teamInfoResponse.body.team.url;

  if (!!domain && !!slackUrl) {
    await updateAccountRedirectDomain(accountId, domain, slackUrl);
  }

  // create and join channels
  let channels = await createChannels(account.slackTeamId, token, accountId);

  // If channelId is part of parameter only sync the specific channel
  if (!!channelId) {
    channels = [channels.find((c) => c.id === channelId)];
  }

  //paginate and find all the users
  console.log('Syncing users for account: ', accountId);
  const usersListResponse = await listUsers(token);
  const members: any[] = usersListResponse.body.members;

  let userCursor: string | null =
    usersListResponse?.body?.response_metadata?.next_cursor;

  while (!!userCursor) {
    try {
      console.log({ userCursor });
      const usersListResponse = await listUsers(token, userCursor);
      const additionalMembers = usersListResponse?.body?.members;
      if (!!additionalMembers) {
        members.push(...additionalMembers);
      }
      userCursor = usersListResponse?.body?.response_metadata?.next_cursor;
    } catch (e) {
      console.log('fetching user failed', e.message);
      userCursor = null;
    }
  }

  //Only save new users
  console.log('Saving users');
  const usersSlackIds = await prisma.users.findMany({
    where: { accountsId: account.id },
    select: {
      slackUserId: true,
    },
  });

  const ids = usersSlackIds.map((u) => u.slackUserId);

  const newMembers = members.filter((m) => {
    return !ids.includes(m.id);
  });

  await saveUsers(newMembers, accountId);

  const usersInDb = await prisma.users.findMany({
    where: { accountsId: account.id },
    select: {
      slackUserId: true,
      id: true,
    },
  });

  //fetch and save all top level conversations
  for (let i = 0; i < channels.length; i++) {
    const c = channels[i];
    console.log('Syncing channel: ', c.channelName);

    let nextCursor: string | null = null;
    let firstLoop = true;

    //fetch all messages by paginating
    while (!!nextCursor || firstLoop) {
      console.log('Messages cursor: ', nextCursor);
      try {
        const additionalConversations = await fetchConversationsTyped(
          c.slackChannelId,
          account.slackAuthorizations[0].accessToken,
          nextCursor
        );

        const additionaMessages = additionalConversations.messages;

        //save all messages
        await saveMessagesTransaction(additionaMessages, c.id, usersInDb);
        nextCursor = additionalConversations.response_metadata?.next_cursor;
      } catch (e) {
        console.log('fetching messages failed', e.message);
        await new Promise((resolve) => {
          console.log('waiting 10 seconds');
          setTimeout(resolve, 10000);
        });

        nextCursor = null;
      }
      firstLoop = false;
    }
  }

  //Save all threads
  // only fetch threads with single message
  // There will be edge cases where not all the threads are sync'd if you cancel the script
  const messageWithThreads = await findSlackThreadsWithOnlyOneMessage(
    channels.map((c) => c.id)
  );
  console.log('syncing threads: ', messageWithThreads.length);

  for (let i = 0; i < messageWithThreads.length - 1; i++) {
    console.log(i);
    const m = messageWithThreads[i];
    const channel = account.channels.find((c) => c.id === m.channelId);
    const replies = await fetchReplies(
      m.slackThreadTs,
      channel.slackChannelId,
      token
    );

    const replyMessages = replies?.body;
    try {
      await saveMessagesSyncronous(
        replyMessages.messages,
        m.channelId,
        usersInDb
      );
    } catch (e) {
      console.log(e);
    }
  }

  res.status(200).json({});
}

export async function fetchAllMessages(
  token: string,
  accountId: string,
  channels: any[]
) {
  for (let channel of channels) {
    try {
      const conversations = await fetchConversations(
        channel.slackChannelId,
        token
      );

      let messages = await saveMessages(
        conversations.body.messages,
        channel.id,
        channel.slackChannelId
      );
    } catch (e) {}
  }

  const messageWithThreads = await findMessagesWithThreads(accountId);
  await fetchAndSaveThreadMessages(messageWithThreads, token);
  return messageWithThreads;
}

async function createChannels(
  slackTeamId: string,
  token: string,
  accountId: string
) {
  const channelsResponse = await getSlackChannels(slackTeamId, token);
  const channelsParam = channelsResponse.body.channels.map(
    (channel: { id: any; name: any }) => {
      return {
        slackChannelId: channel.id,
        channelName: channel.name,
        accountId,
      };
    }
  );

  try {
    await createManyChannel(channelsParam);
  } catch (e) {
    console.log('Error creating Channels:', e);
  }

  const channels = await channelIndex(accountId);

  for (let channel of channels) {
    await joinChannel(channel.slackChannelId, token);
  }

  return channels;
}

type UserMap = {
  slackUserId: string;
  id: string;
};

export async function saveMessagesTransaction(
  messages: ConvesrationHistoryMessage[],
  channelId: string,
  users: UserMap[]
) {
  const threadsTransaction = messages
    .map((m) => {
      if (!!m.thread_ts) {
        return prisma.slackThreads.upsert({
          where: {
            slackThreadTs: m.thread_ts,
          },
          update: {},
          create: { slackThreadTs: m.thread_ts, channelId },
        });
      } else {
      }
      return null;
    })
    .filter((e) => e);

  const threads = await prisma.$transaction(threadsTransaction);

  const createMessagesTransaction = messages.map((m) => {
    let threadId: string | null;
    let thread: any | null;

    if (!!m.thread_ts) {
      thread = threads.find((t) => t.slackThreadTs === m.thread_ts);
    }

    let user: UserMap | null = null;
    if (!!m.user) {
      user = users.find((u) => u.slackUserId === m.user);
    }

    threadId = thread?.id;
    const text = m.text as string;
    return prisma.messages.upsert({
      where: {
        body_sentAt: {
          body: text,
          sentAt: new Date(parseFloat(m.ts) * 1000),
        },
      },
      update: {
        slackMessageId: m.ts as string,
        slackThreadId: threadId,
        usersId: user?.id,
      },
      create: {
        body: m.text,
        sentAt: new Date(parseFloat(m.ts) * 1000),
        channelId,
        slackMessageId: m.ts as string,
        slackThreadId: threadId,
        usersId: user?.id,
      },
    });
  });
  console.log('Starting to save messages: ', new Date());
  await prisma.$transaction(createMessagesTransaction);
  console.log('Finished saving messages', new Date());
}

export async function saveMessagesSyncronous(
  messages: ConvesrationHistoryMessage[],
  channelId: string,
  users: UserMap[]
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

    let user: UserMap | null = null;
    if (!!m.user) {
      user = users.find((u) => u.slackUserId === m.user);
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
        usersId: user?.id,
      },
      create: {
        body: m.text,
        sentAt: new Date(parseFloat(m.ts) * 1000),
        channelId,
        slackMessageId: m.ts as string,
        slackThreadId: threadId,
        usersId: user?.id,
      },
    });
  }
}
