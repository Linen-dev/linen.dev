import type { messageReactions } from '@prisma/client';
import { SerializedUser } from 'serializers/user';

export interface SerializedReaction {
  type: string;
  count: number;
  users: SerializedUser[];
}

export default function serialize(
  reaction: messageReactions
): SerializedReaction {
  return {
    type: reaction.name,
    count: reaction.count as number,
    users: [],
  };
}
