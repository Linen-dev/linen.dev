import React from 'react';
import { SerializedUser } from '@linen/types';

function getDisplayName(userId: string, mentions?: SerializedUser[]) {
  if (!mentions) {
    return 'User';
  }
  return userId === 'channel'
    ? userId
    : mentions.find(
        (user) => user.id === userId || user.externalUserId === userId
      )?.displayName || 'User';
}

interface Props {
  tag: '@' | '!';
  value: string;
  mentions?: SerializedUser[];
}

export default function Mention({ tag, value, mentions }: Props) {
  return (
    <strong>
      {tag}
      {getDisplayName(value, mentions)}
    </strong>
  );
}
