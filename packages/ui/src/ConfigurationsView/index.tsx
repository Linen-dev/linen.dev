import React from 'react';
import Header from './Header';
import {
  SerializedChannel,
  AccountType,
  SerializedAccount,
} from '@linen/types';
import styles from './index.module.scss';
import CommunityIntegrationRow from './CommunityIntegrationRow';
import SlackImportRow from './SlackImportRow';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelOrderRow from './ChannelOrderRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';
import UrlsRow from './UrlsRow';
import CommunityTypeRow from './CommunityTypeRow';
import debounce from '@linen/utilities/debounce';
import Toast from '@/Toast';
import RemoveCommunity from './RemoveCommunity';
import ChannelsConfig from './ChannelsConfig';
import type { ApiClient } from '@linen/api-client';

export default function ConfigurationsView({
  currentCommunity,
  channels,
  setChannels,
  api,
}: {
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  setChannels(channels: SerializedChannel[]): void;
  api: ApiClient;
}) {
  const updateAccount = debounce(api.updateAccount);
  const key = channels.map(({ id }) => id).join();

  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <CommunityIntegrationRow
          currentCommunity={currentCommunity}
          api={api}
        />
        <hr className={styles.my3} />
        {currentCommunity.communityType !== 'discord' && (
          <>
            <SlackImportRow currentCommunity={currentCommunity} api={api} />
            <hr className={styles.my3} />
          </>
        )}
        <AnonymizeUsersRow currentCommunity={currentCommunity} api={api} />
        <hr className={styles.my3} />
        <DefaultChannelRow
          key={`default-row-${key}`}
          channels={channels}
          currentCommunity={currentCommunity}
          api={api}
          defaultChannel={channels.find((channel) => channel.default)}
        />
        <hr className={styles.my3} />
        <ChannelOrderRow
          currentCommunity={currentCommunity}
          onChange={setChannels}
          channels={channels}
          api={api}
        />
        <hr className={styles.my3} />
        <ChannelVisibilityRow
          key={`channel-visibility-${key}`}
          currentCommunity={currentCommunity}
          onChange={setChannels}
          api={api}
        />
        <hr className={styles.my3} />
        <ChannelsConfig currentCommunity={currentCommunity} api={api} />
        <hr className={styles.my3} />
        <UrlsRow currentCommunity={currentCommunity} api={api} />
        <hr className={styles.my3} />
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
        <hr className={styles.my3} />
        <RemoveCommunity currentCommunity={currentCommunity} api={api} />
      </div>
    </div>
  );
}
