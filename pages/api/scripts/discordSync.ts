import { NextApiRequest, NextApiResponse } from 'next/types';
import request from 'superagent';
import {
  Author,
  DiscordMessage,
} from '../../../types/discordResponses/discordMessagesInterface';
import { prisma } from '../../../client';
import { channels, Prisma, slackThreads, users } from '@prisma/client';
import {
  findOrCreateChannel,
  updateAccountSlackSyncStatus,
} from '../../../lib/models';
import { createSlug } from '../../../lib/util';
import { sendNotification } from 'services/slack';

enum SyncStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

async function updateAndNotifySyncStatus(
  accountId: string,
  status: SyncStatus
) {
  await updateAccountSlackSyncStatus(accountId, status);
  try {
    await sendNotification(
      `Syncing process is ${status} for account: ${accountId}.`
    );
  } catch (e) {
    console.error('Failed to send Slack notification: ', e);
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const accountId = request.query.account_id as string;

  console.log({ accountId });
  const account = await prisma.accounts.findUnique({
    where: {
      id: accountId,
    },
    include: {
      // slackAuthorizations: {
      //   orderBy: {
      //     createdAt: 'desc',
      //   },
      // },
      discordAuthorizations: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      channels: true,
    },
  });

  if (!account || !account.discordServerId) {
    return response.status(404).json({ error: 'Account not found' });
  }

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    return response.status(500).json({ error: 'No discord token set' });
  }

  await updateAndNotifySyncStatus(account.id, SyncStatus.IN_PROGRESS);

  try {
    await sync(account.discordServerId, account.id, token);
  } catch (error) {
    await updateAndNotifySyncStatus(account.id, SyncStatus.ERROR);
    throw error;
  }

  await updateAndNotifySyncStatus(account.id, SyncStatus.DONE);

  response.status(200).json({});
}

async function getAuthorsFromDatabase(accountId: string) {
  const users = await prisma.users.findMany({
    where: { accountsId: accountId },
  });
  let authors: Record<string, users> = {};
  for (const user of users) {
    authors[user.slackUserId] = user;
  }
  return authors;
}

// Really similar to the Slack Sync function probably should refactor and add tests
async function sync(serverId: string, accountId: string, token: string) {
  const savedChannels = await listChannelsAndPersist(
    serverId,
    accountId,
    token
  );

  let authors = await getAuthorsFromDatabase(accountId);

  // pagination it is weird, needs a "before" timestamp, that means they return the latest messages
  // to get older messages we need to check our oldest and sent the timestamp on the request until has_more attribute is empty
  // so if a synchronization fails, we should persist the cursor? just for the initial process, we should persist the oldest timestamp
  // if runs without errors the next sync execution should look for the latest message on database and
  // query the api until reach the same/older timestamp
  // what about the edited messages?
  console.log('savedChannels', savedChannels.length);
  for (const channel of savedChannels) {
    const threadsOnChannel = await listPublicArchivedThreadsAndPersist({
      channel,
      token,
    });
    // threads works as channels, we need to get their messages
    // replies are just attributes that references another message, need to do some crazy stuff here
    // singles are singles, could potentially be a "thread" of some other message references to it
    console.log(
      'threadsOnChannel',
      channel.channelName,
      threadsOnChannel.length
    );
    for (const thread of threadsOnChannel) {
      // when list message, it comes with the author
      // "type": 7 are just joins
      await listMessagesFromThreadAndPersist({
        thread,
        token,
        authors,
        accountId,
      });
    }
  }
  console.log({ message: 'success' });
  return {};
}

async function listMessagesFromThreadAndPersist({
  thread,
  token,
  authors,
  accountId,
}: {
  thread: DiscordThreads;
  token: string;
  authors: any;
  accountId: string;
}) {
  const threadInDb = await prisma.slackThreads.findUnique({
    where: { slackThreadTs: thread.id },
  });
  if (!threadInDb) return;

  // get messages has no attribute called has_more, we just need to query until is less than 50 or a specific limit
  // the messages is return in latest order, so we need to request with the oldest id as "before" parameter
  // at least for the initial sync
  let hasMore = true;
  const messages: DiscordMessage[] = [];
  let oldestMessageId;
  while (hasMore) {
    hasMore = false;
    const response = await getDiscordThreadMessages(
      threadInDb.slackThreadTs,
      token,
      oldestMessageId
    );
    hasMore = response?.length === 50;
    if (response?.length) {
      messages.push(...response);
      hasMore && (oldestMessageId = getShorterMessagesTimeStamp(response));
      await persistMessages({
        messages: response,
        authors,
        accountId,
        threadInDb,
      });
    }
  }
}

/** be aware that this functions updates the authors object */
async function findAuthorsAndPersist(
  messages: DiscordMessage[],
  authors: any,
  accountsId: string
) {
  let thereIsNewAuthors: Author[] = [];
  messages.forEach((message) => {
    // has author and isn't in our authors object
    if (message.author.id && !authors[message.author.id]) {
      thereIsNewAuthors.push(message.author);
      authors[message.author.id] = true; // just to avoid dup
    }
  });
  if (thereIsNewAuthors.length) {
    console.log('thereIsNewAuthors', thereIsNewAuthors.length);
    for (const newUser of thereIsNewAuthors) {
      const user = await prisma.users.create({
        data: {
          slackUserId: newUser.id,
          accountsId,
          displayName: newUser.username,
          isAdmin: false, // TODO
          isBot: false, // TODO
          // profileImageUrl: TODO
        },
      });
      authors[newUser.id] = {
        ...newUser,
        persisted: true,
        id: user.id,
      };
    }
  }
}

async function persistMessages({
  messages,
  authors,
  accountId,
  threadInDb,
}: {
  messages: DiscordMessage[];
  authors: any;
  accountId: string;
  threadInDb: slackThreads;
}) {
  // first we need to insert the users to have the userId available
  await findAuthorsAndPersist(messages, authors, accountId);

  // each message has the author
  // has mentions and reactions, but not sure if we should tackle this now
  // lets keep simple, just authors
  console.log('messages', messages?.length);
  const transaction = messages
    // ?.filter((m) => m.type !== 7)
    .map((message) => {
      let content =
        message.content || message.referenced_message?.content || '';
      const userId: users = authors[message.author.id];
      return prisma.messages.upsert({
        where: {
          channelId_slackMessageId: {
            channelId: threadInDb.channelId,
            slackMessageId: message.id,
          },
        },
        update: {
          slackMessageId: message.id,
          slackThreadId: threadInDb.id,
          usersId: userId.id,
          body: content,
        },
        create: {
          body: content,
          sentAt: new Date(message.timestamp),
          channelId: threadInDb.channelId,
          slackMessageId: message.id,
          slackThreadId: threadInDb.id,
          usersId: userId.id,
        },
      });
    });
  transaction && (await prisma.$transaction(transaction));
}

async function listChannelsAndPersist(
  serverId: string,
  accountId: string,
  token: string
) {
  const channels = await getDiscordChannels(serverId, token);
  const channelPromises = Promise.all(
    channels.map((channel: discordChannel) => {
      return findOrCreateChannel({
        slackChannelId: channel.id,
        channelName: channel.name,
        accountId,
      });
    })
  );
  return await channelPromises;
}

async function persistThreads(threads: DiscordThreads[], channelId: string) {
  //Save discord threads
  const threadsTransaction: any = threads
    .map((thread: DiscordThreads) => {
      if (!thread.id) {
        return null;
      }
      return prisma.slackThreads.upsert({
        where: {
          slackThreadTs: thread.id,
        },
        update: { messageCount: thread.message_count },
        create: {
          slackThreadTs: thread.id,
          channelId,
          messageCount: thread.message_count,
          slug: createSlug(thread.name),
        },
      });
    })
    .filter(Boolean);

  return await prisma.$transaction(threadsTransaction);
}

/**
  List Public Archived Threads GET/channels/{channel.id}/threads/archived/public
  Requires the READ_MESSAGE_HISTORY permission.
 */
async function listPublicArchivedThreadsAndPersist({
  channel,
  token,
}: {
  channel: channels;
  token: string;
}) {
  let hasMore = true;
  const threads: DiscordThreads[] = [];
  let timestamp;
  while (hasMore) {
    const response = await getAllArchivedThreads(
      channel.slackChannelId,
      timestamp,
      token
    );
    hasMore = response.hasMore;
    if (response.threads && response.threads.length) {
      threads.push(...response.threads);
      timestamp = getShorterTimeStamp(response.threads);
      await persistThreads(response.threads, channel.id);
    }
  }
  return threads;
}

//creates an array and pushes the content of the replies onto it
async function getReplies(channelId: string, token: string) {
  const messages = await getDiscord(`/channels/${channelId}/messages`, token);
  const replies = messages.body
    .filter(
      (message: DiscordMessage) =>
        message.message_reference && message.type === 0
    )
    .reverse();

  const roots = messages.body.filter(
    (m: DiscordMessage) => !m.message_reference && m.type === 0
  );

  // Discord returns each message with the parent message it is referencing
  // Ideally we have messages and all the child messages that is replying to it
  // what we ended up doing is reversing the relation with a dictionary
  // Then went through and used breadth first search traversal to create the threads
  let dict: { [index: string]: DiscordMessage[] } = {};

  replies.forEach((ele: DiscordMessage) => {
    if (ele.referenced_message) {
      if (!dict[ele.referenced_message.id]) {
        dict[ele.referenced_message.id] = [];
      }
      dict[ele.referenced_message.id].push(ele);
    }
  });

  const threads = roots.map((root: DiscordMessage) => {
    let queue: DiscordMessage[] = [root];
    let result: DiscordMessage[] = [];
    while (queue.length > 0) {
      const message = queue.shift();
      if (!message) {
        return;
      }

      result.push(message);

      if (dict[message.id]) {
        queue.push(...dict[message.id]);
      }
    }
    return result;
  });

  return threads;
}

async function saveDiscordThreads(
  threads: Prisma.slackThreadsUncheckedCreateInput
) {
  return prisma.slackThreads.upsert({
    where: { slackThreadTs: threads.slackThreadTs },
    update: {},
    create: threads,
  });
}

async function saveDiscordChannels(channel: Prisma.channelsCreateInput) {
  return prisma.channels.upsert({
    where: {
      slackChannelId: channel.slackChannelId,
    },
    update: {},
    create: channel,
  });
}

async function getDiscord(path: string, token: string, query: any = {}) {
  // console.log({ token });
  // const token = process.env.DISCORD_TOKEN;

  const url = 'https://discord.com/api';

  const response = await request
    .get(url + path)
    .query(query)
    .set('Authorization', 'Bot ' + token);
  return response;
}

async function getUsers(serverId: string, token: string) {
  const response = await getDiscord(`/guilds/${serverId}/members`, token);
  return response.body;
}

async function getDiscordChannels(
  serverId: string,
  token: string
): Promise<discordChannel[]> {
  const result = await getDiscord(`/guilds/${serverId}/channels`, token);
  return result.body?.filter((c: discordChannel) => c?.type === 0);
}

export interface guildChannelsResponse {}

export interface discordChannel {
  id: string;
  type: number;
  name: string;
  position: number;
  parent_id?: string | null;
  guild_id: string;
  last_message_id?: string | null;
  topic?: null;
  rate_limit_per_user?: number | null;
  nsfw?: boolean | null;
  bitrate?: number | null;
  user_limit?: number | null;
  rtc_region?: null;
}

// Todos:
// Make sure we handle private threads and don't render them
export interface GuildActiveThreads {
  threads?: DiscordThreads[] | null;
  members?: null[] | null;
}

async function getAllActiveThreads(serverId: string, token: string) {
  let result = [];
  // Given a server id - gets all the active threads in that server
  try {
    const activeThreads = (
      await getDiscord(`/guilds/${serverId}/threads/active`, token)
    ).body as GuildActiveThreads;

    const threadIds =
      activeThreads.threads?.map((thread: DiscordThreads) => {
        return thread.id;
      }) || [];

    for (const i in threadIds) {
      const id = threadIds[i];
      const message = await getDiscordThreadMessages(id, token);
      result.push(message);
    }

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(4, String(error));
  }
  return result;
}

async function getAllArchivedThreads(
  channelId: string,
  beforeCursor: string | undefined,
  token: string
): Promise<{ threads: DiscordThreads[]; hasMore: boolean }> {
  const response = await retryPromise(
    getDiscord(`/channels/${channelId}/threads/archived/public`, token, {
      before: beforeCursor,
    })
  )
    .then((e) => e?.body)
    .catch(() => {
      return { has_more: false, threads: [] };
    });

  const hasMore = response?.has_more;
  const threads = response?.threads as DiscordThreads[];

  return {
    threads,
    hasMore,
  };
}

async function getDiscordThreadMessages(
  threadId: string,
  token: string,
  oldestMessageId?: string
): Promise<DiscordMessage[]> {
  const response = await retryPromise(
    getDiscord(`/channels/${threadId}/messages`, token, {
      before: oldestMessageId,
    })
  ).catch(() => {
    return { body: [] };
  });
  const messages = response.body;
  return messages;
}

//TODOS:
// create a new account
// Render the client side with new account

export interface DiscordThreads {
  id: string;
  guild_id: string;
  parent_id: string;
  owner_id: string;
  type: number;
  name: string;
  last_message_id: string;
  thread_metadata: ThreadMetadata;
  message_count: number;
  member_count: number;
  rate_limit_per_user: number;
  flags: number;
}

export interface ThreadMetadata {
  archived: boolean;
  archive_timestamp: string;
  auto_archive_duration: number;
  locked: boolean;
  create_timestamp: string;
}

function getShorterTimeStamp(threads: any): string | undefined {
  if (!threads || !threads.length) return;
  const sortedThread = threads
    ?.map((t: any) => new Date(t.thread_metadata.create_timestamp))
    .sort((a: Date, b: Date) => a.getTime() - b.getTime())
    .shift();
  return sortedThread && sortedThread.toISOString();
}

function getShorterMessagesTimeStamp(
  messages: DiscordMessage[]
): string | undefined {
  if (!messages || !messages.length) return;
  const sortedThread = messages
    .sort(
      (a: DiscordMessage, b: DiscordMessage) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .shift();
  return sortedThread && sortedThread.id;
}

/** default values are: 10 seconds of sleep, 3 retries and stops on 404, 403, 401 */
async function retryPromise(
  promise: Promise<any>,
  retries = 3,
  skipOn = [404, 403, 401],
  sleepSeconds = 10
) {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let attempts = 0;
  while (attempts < retries) {
    attempts++;
    try {
      return await promise;
    } catch (error: any) {
      console.error(error.message, error.status, String(error));
      if (skipOn.includes(error?.status)) {
        console.error('Skip retry due error status:', error.status);
        throw error;
      }
      await sleep(sleepSeconds * 1000);
    }
  }
  throw new Error('Retries attempts exceeded');
}
