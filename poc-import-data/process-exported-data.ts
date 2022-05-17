import { accounts, channels, users } from '@prisma/client';
import {
  ConvesrationHistoryMessage,
  joinChannel,
  saveUsers,
} from '../fetch_all_conversations';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { createSlug } from '../lib/util';

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

// const basePath = './poc-import-data/data/prefect/';
// const slackTeamId = 'TL09B008Y';

const basePath = './poc-import-data/data/future/';
const slackTeamId = 'T5TCAFTA9';

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
      slackUserId: true,
      id: true,
    },
  });
  console.timeEnd('retrieve-users');
  stats.users_in_db = usersInDb.length;
  console.time('toObject-users');

  return toObject(usersInDb, 'slackUserId');
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
      slackChannelId: channel.id,
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
      slackChannelId: { in: channelsParam.map((e: any) => e.slackChannelId) },
      accountId: account.id,
    },
  });
  // TODO: need token
  //   for (let channel of channels) {
  //     await joinChannel(channel.slackChannelId, token);
  //   }

  return channels;
}

async function processChannels({
  channel,
  userGroupBySlackUserId,
}: {
  channel: channels;
  userGroupBySlackUserId: any;
}) {
  const files = listFiles(channel.channelName);
  stats.files += files.length;
  // loop on files
  for (const fileName of files) {
    // persist messages
    // console.time(channel.channelName + fileName)
    await processFile({ channel, fileName, userGroupBySlackUserId });
    // console.timeEnd(channel.channelName + fileName)
  }
}

function listFiles(channelName: string) {
  return fs.readdirSync(basePath + channelName + '/', 'utf8');
}

async function processFile({
  channel,
  fileName,
  userGroupBySlackUserId,
}: {
  channel: channels;
  fileName: string;
  userGroupBySlackUserId: UserMap;
}) {
  const messages = readParseFile(channel.channelName + '/' + fileName);
  try {
    await saveMessagesTransaction(messages, channel.id, userGroupBySlackUserId);
  } catch (error) {
    console.error(String(error), channel.channelName + '/' + fileName);
  }
}

let threadsBySlackThreadTs: any = {};

async function saveMessagesTransaction(
  messages: ConvesrationHistoryMessage[],
  channelId: string,
  userGroupBySlackUserId: UserMap
) {
  const messagesByType = groupMessageByType(messages);
  stats.message += messagesByType?.message?.length || 0;
  stats.unknown += messagesByType?.unknown?.length || 0;
  stats.single += messagesByType?.single?.length || 0;
  stats.thread += messagesByType?.thread?.length || 0;

  const singlesTransaction = messagesByType.single?.map((m) => {
    return {
      slackThreadTs: m.ts as string,
      channelId,
      slug: createSlug(m.text),
      messageCount: 1,
    };
  });

  if (singlesTransaction && singlesTransaction.length) {
    await prisma.slackThreads.createMany({
      data: singlesTransaction,
      skipDuplicates: true,
    });
  }

  const threadsTransaction = messagesByType.thread?.map((m) => {
    return {
      slackThreadTs: m.ts as string,
      channelId,
      slug: createSlug(m.text),
      messageCount: ((m.reply_count as number) || 0) + 1,
    };
  });

  if (threadsTransaction && threadsTransaction.length) {
    await prisma.slackThreads.createMany({
      data: threadsTransaction,
      skipDuplicates: true,
    });
    const newThreads = await prisma.slackThreads.findMany({
      where: {
        slackThreadTs: { in: threadsTransaction.map((e) => e.slackThreadTs) },
      },
    });
    threadsBySlackThreadTs = {
      ...threadsBySlackThreadTs,
      ...toObject(newThreads, 'slackThreadTs'),
    };
  }

  const createMessagesTransaction = messagesByType.message?.map((m) => {
    let thread = threadsBySlackThreadTs[m.thread_ts as string];
    let user = m.user ? userGroupBySlackUserId[m.user] : null;
    let threadId = thread?.id;
    const mentionedUserIds = getMentionedUsers(m.text);

    const mentionedUsers = [];
    for (const userId of mentionedUserIds) {
      mentionedUsers.push(userGroupBySlackUserId[userId]);
    }

    return prisma.messages.upsert({
      where: {
        channelId_slackMessageId: {
          channelId,
          slackMessageId: m.ts as string,
        },
      },
      create: {
        body: m.text,
        sentAt: new Date(parseFloat(m.ts) * 1000),
        channelId,
        slackMessageId: m.ts as string,
        slackThreadId: threadId,
        usersId: user?.id,
        mentions: {
          createMany: {
            skipDuplicates: true,
            data: mentionedUsers.map((mention) => ({
              usersId: mention.id,
            })),
          },
        },
      },
      update: {
        body: m.text,
        sentAt: new Date(parseFloat(m.ts) * 1000),
        slackThreadId: threadId,
        usersId: user?.id,
        mentions: {
          createMany: {
            skipDuplicates: true,
            data: mentionedUsers.map((mention) => ({
              usersId: mention.id,
            })),
          },
        },
      },
    });
  });

  if (createMessagesTransaction && createMessagesTransaction.length) {
    await prisma.$transaction(createMessagesTransaction);
  }
}

function getMentionedUsers(text: string) {
  let mentionSlackUserIds = text.match(/<@(.*?)>/g) || [];
  return mentionSlackUserIds.map((m) => m.replace('<@', '').replace('>', ''));
}

const groupMessageByType = (
  messages: any[]
): {
  single?: ConvesrationHistoryMessage[];
  thread?: ConvesrationHistoryMessage[];
  message?: ConvesrationHistoryMessage[];
  unknown?: ConvesrationHistoryMessage[];
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
  console.time('run');
  // find or create account
  const account = await findOrCreateAccount(); // TODO: find or create fn
  if (!account) {
    throw 'fail on create account';
  }

  // TODO: notify start

  // upsert users and retrieve all as object
  console.time('upsert-users');
  const userGroupBySlackUserId = await upsertUsers(account);
  console.timeEnd('upsert-users');

  // upsert channels and retrieve all
  console.log('Reading channels, it may take a while');
  const channels = await upsertChannels(account);
  // loop on channels
  for (const channel of channels) {
    console.log('channel', channel.channelName);
    threadsBySlackThreadTs = {}; // clean up
    // persist messages
    console.time(channel.channelName);
    await processChannels({ channel, userGroupBySlackUserId });
    console.timeEnd(channel.channelName);
  }

  // TODO: notify end

  console.log(stats);

  console.timeEnd('run');
})();
