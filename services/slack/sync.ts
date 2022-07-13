import prisma from '../../client';
import {
  ConversationHistoryMessage,
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
  findThreadsWithOnlyOneMessage,
  updateAccountRedirectDomain,
  updateNextPageCursor,
} from '../../lib/models';
import { createSlug } from '../../lib/util';
import { getSlackChannels } from '.';
import {
  SyncStatus,
  updateAndNotifySyncStatus,
} from '../../services/syncStatus';
import { retryPromise, sleep } from '../../utilities/retryPromises';
import { processReactions } from './reactions';
import { processAttachments } from './attachments';

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
    const communityUrl = teamInfoResponse.body.team.url;

    if (!!domain && !!communityUrl) {
      await updateAccountRedirectDomain(accountId, domain, communityUrl);
    }

    // create and join channels
    let channels = await createChannels({
      slackTeamId: account.slackTeamId,
      token,
      accountId,
    });

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
        externalUserId: true,
      },
    });

    const ids = usersSlackIds.map((u) => u.externalUserId);

    const newMembers = members.filter((m) => {
      return !ids.includes(m.id);
    });

    await saveUsers(newMembers, accountId);

    const usersInDb = await prisma.users.findMany({
      where: { accountsId: account.id },
      select: {
        externalUserId: true,
        id: true,
      },
    });

    //fetch and save all top level conversations
    for (let i = 0; i < channels.length; i++) {
      const c = channels[i];
      console.log('Syncing channel: ', c.channelName);
      let nextCursor: any = c.externalPageCursor;
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
            c.externalChannelId,
            account.slackAuthorizations[0].accessToken,
            nextCursor
          );

          const additionalMessages = additionalConversations.messages;

          //save all messages
          await saveMessagesTransaction(
            additionalMessages,
            c.id,
            usersInDb,
            token
          );
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
    const messageWithThreads = await findThreadsWithOnlyOneMessage(
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
            m.externalThreadId,
            channel!.externalChannelId,
            token
          ),
          sleepSeconds: 30,
        });

        const replyMessages: ConversationHistoryMessage[] =
          replies?.body?.messages;
        if (replyMessages && replyMessages.length) {
          await saveMessagesSynchronous(
            replyMessages,
            m.channelId,
            usersInDb,
            token
          );
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

export async function createChannels({
  slackTeamId,
  token,
  accountId,
}: {
  slackTeamId: string;
  token: string;
  accountId: string;
}) {
  const channelsResponse = await getSlackChannels(slackTeamId, token);
  const channelsParam = channelsResponse.body.channels.map(
    (channel: { id: any; name: any }) => {
      return {
        externalChannelId: channel.id,
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

  console.log('Joining channels started');
  for (let channel of channels) {
    await joinChannel(channel.externalChannelId, token);
    // Slack's api can handle bursts
    // so only wait for requests if there are more than 50 messages
    if (channels.length > 50) {
      await sleep(1500);
    }
  }
  console.log('Joining channels ended');

  return channels;
}

type UserMap = {
  externalUserId: string;
  id: string;
};

function getMentionedUsers(text: string, users: UserMap[]) {
  let mentionExternalUserIds = text.match(/<@(.*?)>/g) || [];
  mentionExternalUserIds = mentionExternalUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );

  return users.filter((u) => mentionExternalUserIds.includes(u.externalUserId));
}

async function saveMessagesTransaction(
  messages: ConversationHistoryMessage[],
  channelId: string,
  users: UserMap[],
  token: string
) {
  const threadsTransaction: any = messages
    .map((m) => {
      if (!!m.thread_ts) {
        return prisma.threads.upsert({
          where: {
            externalThreadId: m.thread_ts,
          },
          update: {},
          // maybe here, if creates, slug will be empty
          create: { externalThreadId: m.thread_ts, channelId },
        });
      }
      return null;
    })
    .filter((e) => e);

  const threads = await prisma.$transaction(threadsTransaction);

  const createMessagesTransaction = messages.map(async (m) => {
    let threadId: string | null;
    let thread: any | null;

    if (!!m.thread_ts) {
      thread = threads.find((t) => t.externalThreadId === m.thread_ts);
    }

    let user: UserMap | undefined;
    if (!!m.user) {
      user = users.find((u) => u.externalUserId === m.user);
    }

    threadId = thread?.id;
    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    const serializedMessage = {
      body: m.text,
      blocks: m.blocks,
      sentAt: new Date(parseFloat(m.ts) * 1000),
      channelId,
      externalMessageId: m.ts as string,
      slackThreadId: threadId,
      usersId: user?.id,
    };
    const message = await prisma.messages.upsert({
      where: {
        channelId_externalMessageId: {
          channelId: channelId,
          externalMessageId: m.ts,
        },
      },
      update: serializedMessage,
      create: {
        ...serializedMessage,
        mentions: {
          create: mentionedUsers.map((u) => ({ usersId: u.id })),
        },
      },
    });
    await Promise.all([
      processReactions(m, message),
      processAttachments(m, message, token),
    ]);
  });
  console.log('Starting to save messages: ', new Date());
  await Promise.all(createMessagesTransaction);
  console.log('Finished saving messages', new Date());
}

async function saveMessagesSynchronous(
  messages: ConversationHistoryMessage[],
  channelId: string,
  users: UserMap[],
  token: string
) {
  const threadHead = messages[0];
  if (threadHead.ts === threadHead.thread_ts) {
    await prisma.threads.update({
      where: { externalThreadId: threadHead.thread_ts },
      data: {
        messageCount: (threadHead.reply_count || 0) + 1,
        slug: createSlug(threadHead.text),
      },
    });
  }

  for (let j = 0; j < messages.length; j++) {
    const m = messages[j];
    let threadId: string | null;

    let ts = m.thread_ts || m.ts;
    const thread = await findOrCreateThread({
      externalThreadId: ts,
      channelId: channelId,
    });

    let user: UserMap | undefined;
    if (!!m.user) {
      user = users.find((u) => u.externalUserId === m.user);
    }

    threadId = thread?.id;
    const text = m.text as string;
    const mentionedUsers = getMentionedUsers(text, users);
    const serializedMessage = {
      body: m.text,
      blocks: m.blocks,
      sentAt: new Date(parseFloat(m.ts) * 1000),
      channelId,
      externalMessageId: m.ts as string,
      slackThreadId: threadId,
      usersId: user?.id,
    };
    const message = await prisma.messages.upsert({
      where: {
        channelId_externalMessageId: {
          channelId: channelId,
          externalMessageId: m.ts,
        },
      },
      update: serializedMessage,
      create: {
        ...serializedMessage,
        mentions: {
          create: mentionedUsers.map((u) => ({ usersId: u.id })),
        },
      },
    });

    await Promise.all([
      processReactions(m, message),
      processAttachments(m, message, token),
    ]);
  }
}
