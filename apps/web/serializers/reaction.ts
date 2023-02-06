import type { messageReactions } from '@linen/database';
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
