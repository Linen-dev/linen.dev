import React from 'react';
import { users } from '@prisma/client';

function getDisplayName(userId: string, mentions?: users[]) {
  if (!mentions) {
    return 'User';
  }
  const user = mentions.find((u) => u.externalUserId === userId);
  return user?.displayName || 'User';
}

interface Props {
  value: string;
  mentions?: users[];
}

export default function Mention({ value, mentions }: Props) {
  return <strong>@{getDisplayName(value, mentions)}</strong>;
}
