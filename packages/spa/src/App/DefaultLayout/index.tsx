import React from 'react';
import Header from '../Header';
import {
  SerializedAccount,
  Permissions,
  SerializedChannel,
} from '@linen/types';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
}

export default function DefaultLayout({
  channels,
  currentCommunity,
  permissions,
}: Props) {
  return (
    <Header
      channels={channels}
      currentCommunity={currentCommunity}
      permissions={permissions}
    />
  );
}
