import React from 'react';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import Component from '@linen/ui/Header';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
}

export default function Header({
  currentCommunity,
  channels,
  permissions,
  settings,
}: Props) {
  // return (
  //   <Component channels={channels} currentCommunity={currentCommunity} permissions={permissions} settings={settings} />
  // );
  return <header>header</header>;
}
