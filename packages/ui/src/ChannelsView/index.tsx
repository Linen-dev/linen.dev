import React from 'react';
import Header from './Header';
import { SerializedAccount, SerializedChannel } from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';

interface Props {
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  setChannels: (props: SerializedChannel[]) => void;
  api: ApiClient;
}

export default function ChannelsView({
  currentCommunity,
  channels,
  setChannels,
  api,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <Header />
    </div>
  );
}
