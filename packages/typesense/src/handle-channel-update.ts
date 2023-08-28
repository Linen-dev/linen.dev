import { prisma } from '@linen/database';
import { updateByQuery } from './utils/client';
import { collectionSchema } from './utils/model';
import {
  getAccountSettings,
  pushToTypesense,
  queryThreads,
} from './utils/shared';
import { AnonymizeType, Logger } from '@linen/types';

export async function handleChannelTypeUpdate({
  channelId,
}: {
  channelId: string;
}) {
  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    return `channel not found: ${channelId}`;
  }

  const document = {
    is_public: channel.type === 'PUBLIC',
  };
  await updateByQuery({
    collection: collectionSchema.name,
    filter_by: `accountId:=${channel.accountId} && channel_name:=${channel.channelName}`,
    document,
  });
}

export async function handleChannelNameUpdate({
  channelId,
  logger,
}: {
  channelId: string;
  logger: Logger;
}) {
  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });
  if (!channel || !channel?.accountId) {
    return `channel not found: ${channelId}`;
  }

  const accountSettings = await getAccountSettings(channel?.accountId, logger);
  if (!accountSettings?.searchSettings) {
    return;
  }

  let cursor = 0;
  do {
    const threads = await queryThreads({
      where: {
        channelId,
        incrementId: { gt: cursor },
      },
      orderBy: { incrementId: 'asc' },
      take: 300,
    });

    if (!threads.length) {
      break;
    }

    cursor = threads.at(threads.length - 1)?.incrementId!;

    await pushToTypesense({
      threads,
      is_restrict: accountSettings.searchSettings.scope === 'private',
      logger,
      anonymize: accountSettings.account.anonymizeUsers
        ? (accountSettings.account.anonymize as AnonymizeType)
        : undefined,
    });
  } while (true);
}
