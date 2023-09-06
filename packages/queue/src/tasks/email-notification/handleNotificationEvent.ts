import { MessageFormat, notificationListenerType } from '@linen/types';
import { JobHelpers } from 'graphile-worker';
import { prisma } from '@linen/database';
import { processMentions } from './processMentions';
import { processSubscribers } from './processSubscribers';

export async function handleNotificationEvent(
  data: notificationListenerType,
  helpers: JobHelpers
) {
  const message = await prisma.messages.findUnique({
    select: {
      messageFormat: true,
      author: { select: { auth: { select: { id: true } } } },
    },
    where: { id: data.messageId },
  });

  if (!message) {
    return 'message not found';
  }

  if (message.messageFormat !== MessageFormat.LINEN) {
    return 'message is not from linen';
  }

  const authorId = message.author?.auth?.id;
  if (!authorId) {
    return 'missing authorId';
  }

  await processMentions(data, authorId, helpers);

  if (data.isReply) {
    await processSubscribers(data, authorId, helpers);
    // TODO: check for users subscribed to the channel
  }

  return 'ok';
}
