import { mentions } from '@prisma/client';
import { prisma } from 'client';
import { pushUserMention } from 'services/push';

export async function eventNewMentions({
  mentions = [],
  channelId,
  threadId,
}: {
  mentions: mentions[];
  threadId: string;
  channelId: string;
}) {
  for (const mention of mentions) {
    const user = await prisma.users.findUnique({
      where: { id: mention.usersId },
      select: { auth: { select: { id: true } } },
    });

    if (user?.auth?.id) {
      await pushUserMention({ userId: user.auth.id, threadId, channelId });
    }
  }
}
