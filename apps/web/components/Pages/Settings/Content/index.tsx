import { SerializedAccount, SerializedChannel } from '@linen/types'
import React from 'react';
import styles from './index.module.scss';
import AnonymizeUsersRow from './AnonymizeUsersRow';
import DefaultChannelRow from './DefaultChannelRow';
import ChannelVisibilityRow from './ChannelVisibilityRow';

interface Props {
  channels: SerializedChannel[]
  currentCommunity: SerializedAccount;
}

export default function Content({ channels, currentCommunity }: Props) {

  return (
    <div className={styles.container}>
      <AnonymizeUsersRow currentCommunity={currentCommunity} />
      <hr className="my-3"/>
      <DefaultChannelRow channels={channels} currentCommunity={currentCommunity} />
      <hr className="my-3"/>
      <ChannelVisibilityRow channels={channels} currentCommunity={currentCommunity} />
    </div>
  );
}
