import { accounts, channels, users, PrismaClient } from '@prisma/client';
import {
  ConversationHistoryMessage,
  saveUsers,
} from '../../fetch_all_conversations';
import fs from 'fs';
import { createSlug } from '../../lib/util';
import {
  SyncStatus,
  updateAndNotifySyncStatus,
} from '../../services/syncStatus';
import { processReactions } from '../../services/slack/reactions';
import { processAttachments } from '../../services/slack/attachments';

const prisma = new PrismaClient({}); // initiate a new instance of prisma without info logs

type channel = {
  id: string;
  name: string;
  created: number;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  members: string[];
};

type UserMap = Record<string, users>;

let stats = {
  channels: 0,
  users: 0,
  users_in_db: 0,
  single: 0, // no more singles
  thread: 0,
  message: 0,
  unknown: 0,
  files: 0,
};

// const basePath = './poc-import-data/data/san/';
// const slackTeamId = 'T03ECUWHFGD';

const basePath = './poc-import-data/data/prefect/';
const slackTeamId = 'TL09B008Y';

// const basePath = './poc-import-data/data/future/';
// const slackTeamId = 'T5TCAFTA9';

async function findOrCreateAccount() {
  let account = await prisma.accounts.findFirst({ where: { slackTeamId } });
  if (account) return account;
  const newAccount = await prisma.accounts.create({
    data: {
      slackTeamId,
    },
  });
  return await prisma.accounts.findUnique({
    where: { id: newAccount.id },
  });
}

async function upsertUsers(account: accounts): Promise<UserMap> {
  // read file
  const usersFile = readParseFile('users.json');
  stats.users = usersFile.length;
  console.time('persist-users');
  await saveUsers(usersFile, account.id);
  console.timeEnd('persist-users');

  console.time('retrieve-users');
  const usersInDb = await prisma.users.findMany({
    where: { accountsId: account.id },
    select: {
      externalUserId: true,
      id: true,
    },
  });
  console.timeEnd('retrieve-users');
  stats.users_in_db = usersInDb.length;
  console.time('toObject-users');

  return toObject(usersInDb, 'externalUserId');
}

export function readParseFile(filename: string) {
  const data = fs.readFileSync(basePath + filename, 'utf8');
  return JSON.parse(data);
}

function toObject(arr: any[], key: string) {
  // console.time('toObject')
  let obj: any = {};
  for (const a of arr) {
    obj[a[key]] = a;
  }
  // console.timeEnd('toObject')
  return obj;
}

async function upsertChannels(account: accounts) {
  const channelsFile = readParseFile('channels.json');
  stats.channels = channelsFile.length;
  // copied from pages/api/scripts/sync.ts line 268
  const channelsParam = channelsFile.map((channel: channel) => {
    return {
      externalChannelId: channel.id,
      channelName: channel.name,
      accountId: account.id,
    };
  });
  try {
    await prisma.channels.createMany({
      data: channelsParam,
      skipDuplicates: true,
    });
  } catch (e) {
    console.log('Error creating Channels:', e);
  }
  const channels = await prisma.channels.findMany({
    where: {
      externalChannelId: {
        in: channelsParam.map((e: any) => e.externalChannelId),
      },
      accountId: account.id,
    },
  });
  // TODO: need token
  //   for (let channel of channels) {
  //     await joinChannel(channel.externalChannelId, token);
  //   }

  return channels;
}

async function processChannels({
  channel,
  userGroupByExternalUserId,
}: {
  channel: channels;
  userGroupByExternalUserId: any;
}) {
  const files = listFiles(channel.channelName);
  stats.files += files.length;
  // loop on files
  for (const fileName of files) {
    // persist messages
    // console.time(channel.channelName + fileName)
    await processFile({ channel, fileName, userGroupByExternalUserId });
    // console.timeEnd(channel.channelName + fileName)
  }
}

function listFiles(channelName: string) {
  return fs.readdirSync(basePath + channelName + '/', 'utf8');
}

async function processFile({
  channel,
  fileName,
  userGroupByExternalUserId,
}: {
  channel: channels;
  fileName: string;
  userGroupByExternalUserId: UserMap;
}) {
  const messages = readParseFile(channel.channelName + '/' + fileName);
  try {
    await saveMessagesTransaction(
      messages,
      channel.id,
      userGroupByExternalUserId
    );
  } catch (error) {
    console.error(String(error), channel.channelName + '/' + fileName);
  }
}

let threadsByExternalThreadId: any = {};

async function saveMessagesTransaction(
  messages: ConversationHistoryMessage[],
  channelId: string,
  userGroupByExternalUserId: UserMap
) {
  const messagesByType = groupMessageByType(messages);
  stats.message += messagesByType?.message?.length || 0;
  stats.unknown += messagesByType?.unknown?.length || 0;
  stats.single += messagesByType?.single?.length || 0;
  stats.thread += messagesByType?.thread?.length || 0;

  const singlesTransaction = messagesByType.single?.map((m) => {
    return {
      externalThreadId: m.ts as string,
      channelId,
      slug: createSlug(m.text),
      messageCount: 1,
    };
  });

  if (singlesTransaction && singlesTransaction.length) {
    await prisma.threads.createMany({
      data: singlesTransaction,
      skipDuplicates: true,
    });
  }

  const threadsTransaction = messagesByType.thread?.map((m) => {
    return {
      externalThreadId: m.ts as string,
      channelId,
      slug: createSlug(m.text),
      messageCount: ((m.reply_count as number) || 0) + 1,
    };
  });

  if (threadsTransaction && threadsTransaction.length) {
    await prisma.threads.createMany({
      data: threadsTransaction,
      skipDuplicates: true,
    });
    const newThreads = await prisma.threads.findMany({
      where: {
        externalThreadId: {
          in: threadsTransaction.map((e) => e.externalThreadId),
        },
      },
    });
    threadsByExternalThreadId = {
      ...threadsByExternalThreadId,
      ...toObject(newThreads, 'externalThreadId'),
    };
  }

  const createMessagesTransaction = messagesByType.message?.map(async (m) => {
    let thread = threadsByExternalThreadId[m.thread_ts as string];
    let user = m.user ? userGroupByExternalUserId[m.user] : null;
    let threadId = thread?.id;
    const mentionedUserIds = getMentionedUsers(m.text);

    const mentionedUsers = [];
    for (const userId of mentionedUserIds) {
      mentionedUsers.push(userGroupByExternalUserId[userId]);
    }

    const serializedMessage = {
      body: m.text,
      blocks: m.blocks,
      sentAt: new Date(parseFloat(m.ts) * 1000),
      channelId,
      externalMessageId: m.ts as string,
      threadId: threadId,
      usersId: user?.id,
      mentions: {
        createMany: {
          skipDuplicates: true,
          data: mentionedUsers.map((mention) => ({
            usersId: mention.id,
          })),
        },
      },
    };
    const message = await prisma.messages.upsert({
      where: {
        channelId_externalMessageId: {
          channelId,
          externalMessageId: m.ts as string,
        },
      },
      create: serializedMessage,
      update: serializedMessage,
    });

    await Promise.all([
      processReactions(m, message),
      processAttachments(m, message, 'token'),
    ]);
  });

  if (createMessagesTransaction && createMessagesTransaction.length) {
    await Promise.all(createMessagesTransaction);
  }
}

function getMentionedUsers(text: string) {
  let mentionExternalUserIds = text.match(/<@(.*?)>/g) || [];
  return mentionExternalUserIds.map((m) =>
    m.replace('<@', '').replace('>', '')
  );
}

const groupMessageByType = (
  messages: any[]
): {
  single?: ConversationHistoryMessage[];
  thread?: ConversationHistoryMessage[];
  message?: ConversationHistoryMessage[];
  unknown?: ConversationHistoryMessage[];
} => {
  const messageTypes: any = {
    falsefalse: 'single', // its was single, but we should threat singles as a potential thread
    truetrue: 'thread',
    falsetrue: 'message',
    truefalse: 'unknown',
  };
  const _key = (b: any) => {
    return messageTypes[
      [Boolean(b.reply_count), Boolean(b.thread_ts)].join('')
    ];
  };

  let messagesGroupedByType: any = {};
  for (let message of messages) {
    let key = _key(message);
    messagesGroupedByType[key] = [
      ...(messagesGroupedByType[key] ? messagesGroupedByType[key] : []),
      message,
    ];
  }
  return messagesGroupedByType;
};

(async () => {
  // find or create account
  const account = await findOrCreateAccount(); // TODO: find or create fn
  if (!account) {
    throw 'fail on create account';
  }
  // notify start
  await updateAndNotifySyncStatus(account.id, SyncStatus.IN_PROGRESS);
  try {
    console.time('run');
    // upsert users and retrieve all as object
    console.time('upsert-users');
    const userGroupByExternalUserId = await upsertUsers(account);
    console.timeEnd('upsert-users');
    // upsert channels and retrieve all
    console.log('Reading channels, it may take a while');
    const channels = await upsertChannels(account);
    // loop on channels
    for (const channel of channels) {
      console.log('channel', channel.channelName);
      threadsByExternalThreadId = {}; // clean up
      // persist messages
      console.time(channel.channelName);
      await processChannels({ channel, userGroupByExternalUserId });
      console.timeEnd(channel.channelName);
    }
    console.log(stats);
    console.timeEnd('run');
  } catch (error) {
    await updateAndNotifySyncStatus(account.id, SyncStatus.ERROR);
    throw error;
  }
  await updateAndNotifySyncStatus(account.id, SyncStatus.DONE);
})();
