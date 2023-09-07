import React from 'react';
import { SerializedUser } from '@linen/types';
import { getDisplayName } from '@linen/utilities/getDisplayName';

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
