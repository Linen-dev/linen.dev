import { prisma } from '@linen/database';
import { client } from './utils/client';
import { collectionSchema } from './utils/model';
import {
  getAccountSettings,
  pushToTypesense,
  queryThreads,
} from './utils/shared';
import { Logger } from '@linen/types';

export async function handleChannelTypeUpdate({
  channelId,
}: {
  channelId: string;
}) {
  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    throw new Error('channel not found: ' + channelId);
  }

  await client
    .collections(collectionSchema.name)
    .documents()
    .update(
      {
        is_public: channel.type === 'PUBLIC',
      },
      {
        filter_by: `accountId:=${channel.accountId} && channel_name:=${channel.channelName}`,
      } as any
    );
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
    throw new Error('channel not found: ' + channelId);
  }

  const { searchSettings } = await getAccountSettings(channel?.accountId);

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
      is_restrict: searchSettings.scope === 'private',
      logger,
    });
  } while (true);
}
