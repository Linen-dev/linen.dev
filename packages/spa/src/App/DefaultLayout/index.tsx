import React from 'react';
import Header from '../Header';
import { SerializedAccount } from '@linen/types';

interface Props {
  currentCommunity: SerializedAccount;
}

export default function DefaultLayout({ currentCommunity }: Props) {
  return <Header currentCommunity={currentCommunity} />;
}
