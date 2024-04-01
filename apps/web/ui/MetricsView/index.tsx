import React from 'react';
import Header from './Header';
import Content from './Content';
import { SerializedAccount } from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';

export default function MetricsView({
  currentCommunity,
  api,
}: {
  currentCommunity: SerializedAccount;
  api: ApiClient;
}) {
  return (
    <div className={styles.container}>
      <Header />
      <Content communityId={currentCommunity.id} api={api} />
    </div>
  );
}
