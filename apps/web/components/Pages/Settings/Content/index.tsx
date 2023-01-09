import { AccountType, SerializedAccount, SerializedChannel } from '@linen/types'
import { Toast } from '@linen/ui';
import React from 'react';
import styles from './index.module.scss';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';
import CommunityTypeRow from './CommunityTypeRow'
import debounce from '@linen/utilities/debounce';

interface Props {
  channels: SerializedChannel[]
  currentCommunity: SerializedAccount;
}

const updateAccount = debounce(
  ({ communityId, type }: { communityId: string; type: string }) => {
    fetch('/api/accounts', {
      method: 'PUT',
      body: JSON.stringify({
        communityId,
        type,
      }),
    })
      .then((response) => {
        if (!response.ok) throw response;
        Toast.success('Saved successfully!');
      })
      .catch(() => {
        Toast.error('Something went wrong!');
      });
  }
);

export default function Content({ channels, currentCommunity }: Props) {
  return (
    <div className={styles.container}>
      <AnonymizeUsersRow currentCommunity={currentCommunity} />
      <hr className="my-3"/>
      <DefaultChannelRow channels={channels} currentCommunity={currentCommunity} />
      <hr className="my-3"/>
      <ChannelVisibilityRow channels={channels} currentCommunity={currentCommunity} />
      <hr className="my-3"/>
      <CommunityTypeRow
        type={currentCommunity.type}
        disabled={!currentCommunity.premium}
        onChange={(type: AccountType) => {
          updateAccount({ communityId: currentCommunity.id, type });
        }}
      />
    </div>
  );
}
