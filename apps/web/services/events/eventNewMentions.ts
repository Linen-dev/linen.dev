import { mentions, prisma } from '@linen/database';
import { MentionNode } from '@linen/types';
import { pushUserMention } from 'services/push';

export async function eventNewMentions({
  mentions = [],
  mentionNodes = [],
  channelId,
  threadId,
}: {
  mentions: mentions[];
  mentionNodes: MentionNode[];
  threadId: string;
  channelId: string;
}) {
  for (const mention of mentions) {
    const user = await prisma.users.findUnique({
      where: { id: mention.usersId },
      select: { auth: { select: { id: true } } },
    });

    if (user?.auth?.id) {
      // we could save the mention type in the db instead
      // in that case we'd need to make mentions non unique
      const mentionType = mentionNodes.find(
        (node) => node.id === mention.usersId && node.type === 'signal'
      )
        ? 'signal'
        : 'user';
      await pushUserMention({
        userId: user.auth.id,
        threadId,
        channelId,
        mentionType,
      });
    }
  }
}
