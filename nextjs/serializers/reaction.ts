import type { messageReactions } from '@prisma/client';

export interface SerializedReaction {
  type: string;
  count: number;
}

export default function serialize(
  reaction: messageReactions
): SerializedReaction {
  return {
    type: reaction.name,
    count: reaction.count as number,
  };
}
