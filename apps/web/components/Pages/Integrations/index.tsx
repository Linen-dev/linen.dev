import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import storage from '@linen/utilities/storage';
import styles from './index.module.scss';
import CommunityIntegrationRow from './CommunityIntegrationRow';
import SlackImportRow from './SlackImportRow';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';
import { Toast } from '@linen/ui';
import debounce from '@linen/utilities/debounce';
import * as api from 'utilities/requests';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  communities: SerializedAccount[];
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
}

const debouncedChannelsVisibilityUpdate = debounce(
  ({
    communityId,
    value,
  }: {
    communityId: string;
    value: { id: string; hidden: boolean };
  }) => api.hideChannels({ accountId: communityId, channels: [value] })
);

export default function IntegrationsPage({
  channels: initialChannels,
  currentCommunity,
  communities,
  settings,
  permissions,
  isSubDomainRouting,
}: Props) {
  const [channels, setChannels] =
    useState<SerializedChannel[]>(initialChannels);

  useEffect(() => {
    storage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'settings',
    });
  }, [currentCommunity]);

  async function onChannelsVisibilityChange(value: {
    id: string;
    hidden: boolean;
  }) {
    setChannels((channels) => {
      return channels.map((channel) => {
        if (channel.id === value.id) {
          return {
            ...channel,
            hidden: value.hidden,
          };
        }
        return channel;
      });
    });
    return debouncedChannelsVisibilityUpdate({
      communityId: currentCommunity.id,
      value,
    }).catch(() => Toast.error('Something went wrong. Please try again.'));
  }

  const sortedChannels = channels.sort((a, b) => {
    return a.channelName.localeCompare(b.channelName);
  });

  return (
    <PageLayout
      channels={sortedChannels}
      communities={communities}
      currentCommunity={currentCommunity}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      className="w-full"
    >
      <Header />
      <div className={styles.container}>
        <CommunityIntegrationRow currentCommunity={currentCommunity} />
        <hr className="my-3" />
        {currentCommunity.communityType !== 'discord' && (
          <>
            <SlackImportRow currentCommunity={currentCommunity} />
            <hr className="my-3" />
          </>
        )}
        <AnonymizeUsersRow currentCommunity={currentCommunity} />
        <hr className="my-3" />
        <DefaultChannelRow
          channels={sortedChannels}
          currentCommunity={currentCommunity}
        />
        <hr className="my-3" />
        <ChannelVisibilityRow
          channels={sortedChannels}
          onChange={onChannelsVisibilityChange}
        />
      </div>
    </PageLayout>
  );
}
