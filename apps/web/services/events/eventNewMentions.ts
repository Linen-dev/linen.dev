import { mentions, prisma } from '@linen/database';
import { MentionNode } from '@linen/types';
import { pushUserMention } from 'services/push';

export async function eventNewMentions({
  mentions = [],
  mentionNodes = [],
  channelId,
  threadId,
  authorId,
}: {
  mentions: mentions[];
  mentionNodes: MentionNode[];
  threadId: string;
  channelId: string;
  authorId?: string;
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

  const mentionChannel = mentionNodes.find((m) => m.id === 'channel');
  if (mentionChannel) {
    const members = await prisma.channels.findUnique({
      where: { id: channelId },
      select: {
        memberships: {
          select: {
            user: { select: { authsId: true } },
          },
          ...(!!authorId && { where: { usersId: { not: authorId } } }),
        },
      },
    });
    if (members) {
      const authIds = members?.memberships.map((m) => m.user.authsId);
      for (const authId of authIds) {
        if (authId) {
          await pushUserMention({
            userId: authId,
            threadId,
            channelId,
            mentionType: mentionChannel.type,
          });
        }
      }
    }
  }
}
