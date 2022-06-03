import prisma from '../../client';
import {
  ConvesrationHistoryMessage,
  fetchConversationsTyped,
  fetchReplies,
  fetchTeamInfo,
  joinChannel,
  listUsers,
  saveUsers,
} from '../../fetch_all_conversations';
import {
  channelIndex,
  createManyChannel,
  findAccountById,
  findOrCreateThread,
  findSlackThreadsWithOnlyOneMessage,
  updateAccountRedirectDomain,
  updateNextPageCursor,
} from '../../lib/models';
import { createSlug } from '../../lib/util';
import { getSlackChannels } from '.';
import {
  SyncStatus,
  updateAndNotifySyncStatus,
} from '../../services/syncStatus';
import { retryPromise } from '../../utilities/retryPromises';

export async function slackSync({
  accountId,
  channelId,
  domain,
}: {
  accountId: string;
  channelId?: string;
  domain?: string;
}) {
  console.log(new Date());

  const account = await findAccountById(accountId);

  if (!account || !account.slackTeamId) {
    throw { status: 404, error: 'Account not found' };
  }

  await updateAndNotifySyncStatus(accountId, SyncStatus.IN_PROGRESS);

  try {
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
      const channel = channels.find((c) => c.id === channelId);
      if (!!channel) {
        channels = [channel];
      }
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
        console.log('fetching user failed', (e as Error).message);
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
      let nextCursor: any = c.slackNextPageCursor;
      let firstLoop = true;
      if (nextCursor === 'completed') {
        console.log('channel completed syncing: ', c.channelName);
        continue;
      }
      let retries = 0;

      //fetch all messages by paginating
      while (!!nextCursor || firstLoop) {
        console.log('Messages cursor: ', nextCursor);
        try {
          const additionalConversations = await fetchConversationsTyped(
            c.slackChannelId,
            account.slackAuthorizations[0].accessToken,
            nextCursor
          );

          const additionalMessages = additionalConversations.messages;

          //save all messages
          await saveMessagesTransaction(additionalMessages, c.id, usersInDb);
          nextCursor = additionalConversations.response_metadata?.next_cursor;

          // save cursor in database so don't have
          //to refetch same conversation if script fails
          await updateNextPageCursor(c.id, nextCursor);
        } catch (e) {
          console.log('fetching messages failed', (e as Error).message);
          await new Promise((resolve) => {
            console.log('waiting 10 seconds');
            setTimeout(resolve, 10000);
          });
          retries += 1;
          if (retries > 3) {
            nextCursor = null;
          }
        }
        firstLoop = false;
      }
      await updateNextPageCursor(c.id, 'completed');
      console.log('channel completed syncing: ', c.channelName);
    }

    // Save all threads
    // only fetch threads with single message
    // There will be edge cases where not all the threads are sync'd if you cancel the script
    const messageWithThreads = await findSlackThreadsWithOnlyOneMessage(
      channels.map((c) => c.id)
    );
    console.log('syncing threads: ', messageWithThreads.length);

    for (let i = 0; i < messageWithThreads.length; i++) {
      if (i % 10 === 0) {
        console.log(i);
      }
      const m = messageWithThreads[i];
      const channel = channels.find((c) => c.id === m.channelId);

      try {
        const replies = await retryPromise({
          promise: fetchReplies(
            m.slackThreadTs,
            channel!.slackChannelId,
            token
          ),
          sleepSeconds: 30,
        });

        const replyMessages: ConvesrationHistoryMessage[] =
          replies?.body?.messages;
        if (replyMessages && replyMessages.length) {
          await saveMessagesSyncronous(replyMessages, m.channelId, usersInDb);
        }
      } catch (e) {
        console.error(e);
      }
    }

    await updateAndNotifySyncStatus(accountId, SyncStatus.DONE);

    return {
      status: 200,
      body: {},
    };
  } catch (err) {
    console.error(err);

    await updateAndNotifySyncStatus(accountId, SyncStatus.ERROR);

    throw {
      status: 500,
      error: String(err),
    };
  }
}

// FIXME: possible dead code
// async function fetchAllMessages(
//   token: string,
//   accountId: string,
//   channels: any[]
// ) {
//   for (let channel of channels) {
//     try {
//       const conversations = await fetchConversations(
//         channel.slackChannelId,
//         token
//       );

//       let messages = await saveMessages(
//         conversations.body.messages,
//         channel.id,
//         channel.slackChannelId,
//         accountId
//       );
//     } catch (e) { }
//   }

//   const messageWithThreads = await findMessagesWithThreads(accountId);
//   await fetchAndSaveThreadMessages(messageWithThreads, token, accountId);
//   return messageWithThreads;
// }

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

function getMentionedUsers(text: string, users: UserMap[]) {
  let mentionSlackUserIds = text.match(/<@(.*?)>/g) || [];
  mentionSlackUserIds = mentionSlackUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );

  return users.filter((u) => mentionSlackUserIds.includes(u.slackUserId));
}

async function saveMessagesTransaction(
  messages: ConvesrationHistoryMessage[],
  channelId: string,
  users: UserMap[]
) {
  const threadsTransaction: any = messages
    .map((m) => {
      if (!!m.thread_ts) {
        return prisma.slackThreads.upsert({
          where: {
            slackThreadTs: m.thread_ts,
          },
          update: {},
          // maybe here, if creates, slug will be empty
          create: { slackThreadTs: m.thread_ts, channelId },
        });
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

    let user: UserMap | undefined;
    if (!!m.user) {
      user = users.find((u) => u.slackUserId === m.user);
    }

    threadId = thread?.id;
    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    return prisma.messages.upsert({
      where: {
        channelId_slackMessageId: {
          channelId: channelId,
          slackMessageId: m.ts,
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
        mentions: {
          create: mentionedUsers.map((u) => ({ usersId: u.id })),
        },
      },
    });
  });
  console.log('Starting to save messages: ', new Date());
  await prisma.$transaction(createMessagesTransaction);
  console.log('Finished saving messages', new Date());
}

async function saveMessagesSyncronous(
  messages: ConvesrationHistoryMessage[],
  channelId: string,
  users: UserMap[]
) {
  const threadHead = messages[0];
  if (threadHead.reply_count && threadHead.thread_ts) {
    await prisma.slackThreads.update({
      where: { slackThreadTs: threadHead.thread_ts },
      data: {
        messageCount: threadHead.reply_count + 1,
        slug: createSlug(threadHead.text),
      },
    });
  }

  for (let j = 0; j < messages.length; j++) {
    const m = messages[j];
    let threadId: string | null;

    let ts = m.thread_ts || m.ts;
    const thread = await findOrCreateThread({
      slackThreadTs: ts,
      channelId: channelId,
    });

    // if (!!m.thread_ts) {
    //   thread.messageCount = thread.messages.length
    // } else {
    //   //create slug based on the first message
    //   thread.slug = createSlug(m.text);
    // }

    // await updateSlackThread(thread.id, {
    //   messageCount: thread.messageCount,
    //   // maybe here, if threads.slug is null, will persist null
    //   ...(!!thread.slug && { slug: thread.slug }),
    // });

    let user: UserMap | undefined;
    if (!!m.user) {
      user = users.find((u) => u.slackUserId === m.user);
    }

    threadId = thread?.id;
    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    await prisma.messages.upsert({
      where: {
        channelId_slackMessageId: {
          channelId: channelId,
          slackMessageId: m.ts,
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
        mentions: {
          create: mentionedUsers.map((u) => ({ usersId: u.id })),
        },
      },
    });
  }
}
