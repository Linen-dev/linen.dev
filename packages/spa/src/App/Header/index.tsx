import React from 'react';
import { SerializedAccount } from '@linen/types';

interface Props {
  currentCommunity: SerializedAccount;
}

export default function Header({ currentCommunity }: Props) {
  return <header>{currentCommunity.name}</header>;
}
