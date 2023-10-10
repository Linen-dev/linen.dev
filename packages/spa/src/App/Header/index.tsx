import React from 'react';
import { SerializedAccount } from '@linen/types';
import Component from '@linen/ui/Header';

interface Props {
  currentCommunity: SerializedAccount;
}

export default function Header({ currentCommunity }: Props) {
  return <header>foo</header>;
}
