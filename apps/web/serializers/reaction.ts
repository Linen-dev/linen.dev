import type { messageReactions } from '@prisma/client';
import { SerializedReaction } from '@linen/types';

export default function serialize(
  reaction: messageReactions
): SerializedReaction {
  return {
    type: reaction.name,
    count: reaction.count as number,
    users: [],
  };
}
