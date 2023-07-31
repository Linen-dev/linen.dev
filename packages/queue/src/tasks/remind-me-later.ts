import { prisma } from '@linen/database';
import { push } from '@linen/web/services/push';

interface Payload {
  threadId: string;
  userId: string;
}

export async function reminderMeLaterTask(payload: Payload, helpers: any) {
  const { threadId, userId } = payload;
  helpers.logger.info(
    `Setting remind me later for thread ${threadId}, user ${userId}`
  );
  const status = await prisma.userThreadStatus.findFirst({
    where: {
      threadId,
      userId,
      reminder: true,
    },
  });

  if (status) {
    await prisma.userThreadStatus.deleteMany({
      where: {
        threadId,
        userId,
        reminder: true,
      },
    });

    const thread = await prisma.threads.findFirst({
      where: { id: threadId },
      include: { messages: true },
    });
    if (thread && thread.messages.length > 0) {
      const message = thread.messages[0];
      try {
        await push({
          channelId: thread.channelId,
          threadId,
          messageId: message.id,
          isThread: true,
          isReply: false,
        });
      } catch (exception) {}

      helpers.logger.info(`Push websocket for thread ${threadId}`);
    }
  }
}
