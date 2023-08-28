import { AnonymizeType, Logger, SerializedSearchSettings } from '@linen/types';
import {
  getAccountSettings,
  pushToTypesense,
  queryThreads,
} from './utils/shared';
import { accounts, prisma } from '@linen/database';

export async function handleUserNameUpdate({
  userId,
  accountId,
  logger,
}: {
  userId: string;
  accountId: string;
  logger: Logger;
}) {
  const accountSettings = await getAccountSettings(accountId, logger);
  if (!accountSettings) return;
  await processQuery(
    userId,
    logger,
    accountSettings.searchSettings,
    accountSettings.account,
    queryByAuthor
  );
  await processQuery(
    userId,
    logger,
    accountSettings.searchSettings,
    accountSettings.account,
    queryByMentioned
  );
}

async function queryByMentioned(userId: string, cursor: Date) {
  const mentions = await prisma.mentions.findMany({
    select: { messages: { select: { threadId: true, sentAt: true } } },
    where: { usersId: userId, messages: { sentAt: { lt: cursor } } },
    orderBy: { messages: { sentAt: 'desc' } },
    take: 100,
  });
  const threadIds = [
    ...new Set(
      mentions.map((msg) => msg?.messages?.threadId!).filter((e) => !!e)
    ),
  ];
  return {
    cursor: mentions.at(mentions.length - 1)?.messages?.sentAt!,
    threadIds,
  };
}

async function queryByAuthor(userId: string, cursor: Date) {
  const messages = await prisma.messages.findMany({
    select: { threadId: true, sentAt: true },
    where: {
      sentAt: { lt: cursor },
      author: { id: userId },
    },
    orderBy: { sentAt: 'desc' },
    take: 100,
  });
  const threadIds = [
    ...new Set(messages.map((m) => m.threadId!).filter((e) => !!e)),
  ];
  return { cursor: messages.at(messages.length - 1)?.sentAt!, threadIds };
}

async function processQuery(
  userId: string,
  logger: Logger,
  searchSettings: SerializedSearchSettings,
  account: accounts,
  query: (
    userId: string,
    cursor: Date
  ) => Promise<{
    cursor: Date;
    threadIds: string[];
  }>
) {
  let cursor = new Date();
  do {
    const result = await query(userId, cursor);

    const threads = await queryThreads({
      where: { id: { in: result.threadIds } },
    });

    if (!threads.length) {
      break;
    }

    cursor = result.cursor;

    await pushToTypesense({
      threads,
      is_restrict: searchSettings.scope === 'private',
      logger,
      anonymize: account.anonymizeUsers
        ? (account.anonymize as AnonymizeType)
        : undefined,
    });
  } while (true);
}
