import React from 'react';
import { SerializedUser } from 'serializers/user';

function getDisplayName(userId: string, mentions?: SerializedUser[]) {
  if (!mentions) {
    return 'User';
  }
  const user = mentions.find(
    (user) => user.id === userId || user.externalUserId === userId
  );
  return user?.displayName || 'User';
}

interface Props {
  value: string;
  mentions?: SerializedUser[];
}

export default function Mention({ value, mentions }: Props) {
  return <strong>@{getDisplayName(value, mentions)}</strong>;
}
