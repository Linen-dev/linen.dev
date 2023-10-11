import React from 'react';
import {
  SerializedAccount,
  SerializedChannel,
  Permissions,
} from '@linen/types';
import Component from '@linen/ui/Header';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
}

export default function Header({
  currentCommunity,
  channels,
  permissions,
}: Props) {
  // return (
  //   <Component currentCommunity={currentCommunity} permissions={permissions} />
  // );
  return <header>header</header>;
}
