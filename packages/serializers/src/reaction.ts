import type { messageReactions } from '@linen/database';
import { SerializedReaction } from '@linen/types';

export function serializeReaction(
  reaction: messageReactions
): SerializedReaction {
  return {
    type: reaction.name,
    count: reaction.count as number,
    users:
      reaction.users && Array.isArray(reaction.users)
        ? (reaction.users as string[]).map((id: string) => {
            // our prisma.schema keeps reactions as json
            // instead of a users relation
            // we should fix it in the future
            return {
              authsId: null,
              username: null,
              displayName: null,
              externalUserId: null,
              profileImageUrl: null,
              id,
            };
          })
        : [],
  };
}
