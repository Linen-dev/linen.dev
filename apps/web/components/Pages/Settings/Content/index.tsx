import { SerializedAccount, SerializedChannel } from '@linen/types'
import React from 'react';
import styles from './index.module.scss';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';

interface Props {
  channels: SerializedChannel[]
  currentCommunity: SerializedAccount;
}

export default function Content({ channels, currentCommunity }: Props) {

  return (
    <div className={styles.container}>
      <DefaultChannelRow channels={channels} currentCommunity={currentCommunity} />
      <ChannelVisibilityRow channels={channels} currentCommunity={currentCommunity} />
    </div>
  );
}
