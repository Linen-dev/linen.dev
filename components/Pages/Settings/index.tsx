import React from 'react';
import DashboardLayout from 'components/layout/DashboardLayout';
import { SerializedAccount } from 'serializers/account';
import { channels } from '@prisma/client';
import ChannelsDefault from './Settings/ChannelsDefault';
import ChannelVisibilityCard from './Settings/ChannelVisibilityCard';
import CommunityIntegration from './Settings/CommunityIntegration';
import CommunitySynchronization from './Settings/CommunitySynchronization';
import AnonymizeCard from './Settings/AnonymizeCard';

export interface SettingsProps {
  account?: SerializedAccount;
  channels?: channels[];
}

export function WaitForIntegration() {
  return <p className="text-sm text-gray-400">Waiting for integration</p>;
}

export default function Settings(props: SettingsProps) {
  return (
    <DashboardLayout header="Settings">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-4">
          <CommunityIntegration {...props} />
          <CommunitySynchronization {...props} />
          <AnonymizeCard {...props} />
          <ChannelsDefault {...props} />
          <ChannelVisibilityCard {...props} />
        </div>
      </div>
    </DashboardLayout>
  );
}
