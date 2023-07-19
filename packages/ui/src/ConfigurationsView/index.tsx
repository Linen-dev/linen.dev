import React, { useState } from 'react';
import Header from './Header';
import { AccountType, SerializedAccount } from '@linen/types';
import styles from './index.module.scss';
import CommunityIntegrationRow from './CommunityIntegrationRow';
import SlackImportRow from './SlackImportRow';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import UrlsRow from './UrlsRow';
import CommunityTypeRow from './CommunityTypeRow';
import debounce from '@linen/utilities/debounce';
import Toast from '@/Toast';
import RemoveCommunity from './RemoveCommunity';
import ChannelsConfig from './ChannelsConfig';
import type { ApiClient } from '@linen/api-client';
import ApiKeys from './ApiKeys';

export default function ConfigurationsView({
  currentCommunity,
  api,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}) {
  const updateAccount = debounce(api.updateAccount);

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
        <ApiKeys currentCommunity={currentCommunity} />
        <hr className={styles.my3} />
        <RemoveCommunity currentCommunity={currentCommunity} api={api} />
      </div>
    </div>
  );
}
