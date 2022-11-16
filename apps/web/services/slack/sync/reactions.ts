import { messages } from '@prisma/client';
import type { ConversationHistoryMessage } from '../api';
import prisma from '../../../client';

export async function processReactions(
  m: ConversationHistoryMessage,
  message: messages
) {
  const promises = [];

  if (m.reactions && m.reactions.length) {
    promises.push(
      ...m.reactions.map((reaction) => {
        const serializedReaction = {
          messagesId: message.id,
          name: reaction.name,
          count: reaction.count,
          users: reaction.users,
        };
        return prisma.messageReactions.upsert({
          where: {
            messagesId_name: {
              messagesId: message.id,
              name: reaction.name,
            },
          },
          create: serializedReaction,
          update: serializedReaction,
        });
      })
    );
  }
  return await Promise.all(promises);
}
