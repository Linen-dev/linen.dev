import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import styles from './index.module.scss';
import CommunityIntegrationRow from './CommunityIntegrationRow';
import SlackImportRow from './SlackImportRow';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';

export interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  communities: SerializedAccount[];
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export default function IntegrationsPage({
  channels: initialChannels,
  currentCommunity,
  communities,
  settings,
  permissions,
  isSubDomainRouting,
  dms,
}: Props) {
  const [channels, setChannels] =
    useState<SerializedChannel[]>(initialChannels);

  useEffect(() => {
    localStorage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'settings',
    });
  }, [currentCommunity]);

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
      dms={dms}
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
          currentCommunity={currentCommunity}
          onChange={setChannels}
        />
      </div>
    </PageLayout>
  );
}
