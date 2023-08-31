import { prisma } from '@linen/database';
import { deleteByQuery } from './utils/client';
import { collectionSchema } from './utils/model';

export async function handleChannelDeletion({
  accountId,
  channelId,
  channelName,
}: {
  accountId: string;
  channelId: string;
  channelName: string;
}) {
  const channel = await prisma.channels.findUnique({
    where: { id: channelId },
  });

  if (!!channel) {
    return `channel not deleted: ${channelId}`;
  }

  await deleteByQuery({
    collection: collectionSchema.name,
    filter_by: `accountId:=${accountId} && channel_name:=${channelName}`,
  });
}
