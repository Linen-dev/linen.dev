import React from 'react';
import DashboardLayout from 'components/layout/DashboardLayout';
import { toast } from 'components/Toast';
import { SerializedAccount } from 'serializers/account';
import type { channels, AccountType } from '@prisma/client';
import LinkCard from './Settings/LinkCard';
import ChannelsDefault from './Settings/ChannelsDefault';
import CommunityTypeCard from './Settings/CommunityTypeCard';
import ChannelVisibilityCard from './Settings/ChannelVisibilityCard';
import CommunityIntegration from './Settings/CommunityIntegration';
import AnonymizeCard from './Settings/AnonymizeCard';
import URLs from './Settings/Urls';
import { Invite } from './Members/Invite';
import ImportFromSlack from './Settings/ImportFromSlack';
import debounce from 'awesome-debounce-promise';

export interface SettingsProps {
  account?: SerializedAccount;
  channels?: channels[];
}

const updateAccount = debounce(
  ({ type }) => {
    fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        type,
      }),
    })
      .then((response) => {
        if (!response.ok) throw response;
        toast.success('Saved successfully!');
      })
      .catch(() => {
        toast.error('Something went wrong!');
      });
  },
  250,
  { leading: true }
);

export function WaitForIntegration() {
  return <p className="text-sm text-gray-400">Waiting for integration</p>;
}

export default function Settings(props: SettingsProps) {
  return (
    <>
      <Invite />
      <DashboardLayout header="Settings" account={props.account}>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 divide-y divide-gray-200 divide-solid">
            <LinkCard {...props} />
            <CommunityIntegration {...props} />
            <ImportFromSlack {...props} />
            <AnonymizeCard {...props} />
            <ChannelsDefault {...props} />
            <ChannelVisibilityCard {...props} />
            {props.account && (
              <CommunityTypeCard
                type={props.account.type}
                onChange={(type: AccountType) => {
                  updateAccount({ type });
                }}
              />
            )}
            <URLs {...props} />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
