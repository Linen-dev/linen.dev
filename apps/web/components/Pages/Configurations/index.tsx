import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import {
  Permissions,
  SerializedChannel,
  Settings,
  AccountType,
  SerializedAccount,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import styles from './index.module.scss';
import CommunityIntegrationRow from './CommunityIntegrationRow';
import SlackImportRow from './SlackImportRow';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';
import UrlsRow from './UrlsRow';
import CommunityTypeRow from './CommunityTypeRow';
import debounce from '@linen/utilities/debounce';
import { api } from 'utilities/requests';
import Toast from '@linen/ui/Toast';
import RemoveCommunity from './RemoveCommunity';
import ChannelsConfig from './ChannelsConfig';

export interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  communities: SerializedAccount[];
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

const updateAccount = debounce(api.updateAccount);

export default function ConfigurationsPage({
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
        <hr className="my-3" />
        <ChannelsConfig currentCommunity={currentCommunity} />
        <hr className="my-3" />
        <UrlsRow currentCommunity={currentCommunity} />
        <hr className="my-3" />
        <CommunityTypeRow
          type={currentCommunity.type}
          disabled={!currentCommunity.premium}
          onChange={(type: AccountType) => {
            updateAccount({ accountId: currentCommunity.id, type })
              .then((_) => {
                Toast.success('Saved successfully!');
              })
              .catch(() => {
                Toast.error('Something went wrong!');
              });
          }}
        />
        <hr className="my-3" />
        <RemoveCommunity currentCommunity={currentCommunity} />
      </div>
    </PageLayout>
  );
}
