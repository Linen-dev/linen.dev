import React from 'react';
import DashboardLayout from 'components/layout/DashboardLayout';
import { SerializedAccount } from 'serializers/account';
import { channels } from '@prisma/client';
import LinkCard from './Settings/LinkCard';
import ChannelsDefault from './Settings/ChannelsDefault';
import ChannelVisibilityCard from './Settings/ChannelVisibilityCard';
import CommunityIntegration from './Settings/CommunityIntegration';
import AnonymizeCard from './Settings/AnonymizeCard';
import URLs from './Settings/Urls';

export interface SettingsProps {
  account?: SerializedAccount;
  channels?: channels[];
}

export function WaitForIntegration() {
  return <p className="text-sm text-gray-400">Waiting for integration</p>;
}

export default function Settings(props: SettingsProps) {
  return (
    <DashboardLayout header="Settings" account={props.account}>
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 divide-y divide-gray-200 divide-solid">
          <LinkCard {...props} />
          <CommunityIntegration {...props} />
          <AnonymizeCard {...props} />
          <ChannelsDefault {...props} />
          <ChannelVisibilityCard {...props} />
          <URLs {...props} />
        </div>
      </div>
    </DashboardLayout>
  );
}
