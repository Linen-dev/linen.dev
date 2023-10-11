import React from 'react';
import Header from '../Header';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
}

export default function DefaultLayout({
  channels,
  currentCommunity,
  permissions,
  settings,
}: Props) {
  return (
    <Header
      channels={channels}
      currentCommunity={currentCommunity}
      permissions={permissions}
      settings={settings}
    />
  );
}
