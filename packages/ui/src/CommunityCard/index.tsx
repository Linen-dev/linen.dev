import React from 'react';
import CommunityIcon from '@/CommunityIcon';
import styles from './index.module.scss';
import type { SerializedAccount } from '@linen/types';
import { truncate } from '@linen/utilities/string';
import { appendProtocol } from '@linen/utilities/url';

const getLinenUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://linen.dev';
  } else {
    return `http://localhost:${process.env.PORT ?? 3000}`;
  }
};

function getHomeUrl(account?: SerializedAccount): string {
  if (!account) {
    return '/';
  }
  if (account.premium && account.redirectDomain) {
    return `${appendProtocol(account.redirectDomain)}`;
  } else if (account.slackDomain) {
    return `${getLinenUrl()}/s/${account.slackDomain}`;
  } else if (account.discordDomain) {
    return `${getLinenUrl()}/d/${account.discordDomain}`;
  } else if (account.discordServerId) {
    return `${getLinenUrl()}/d/${account.discordServerId}`;
  }
  return '/';
}

function CommunityCard({ community }: { community: SerializedAccount }) {
  return (
    <a href={getHomeUrl(community)} className={styles.card} target="_blank">
      <CommunityIcon community={community} />
      <div className={styles.content}>
        <h2>{community.name}</h2>
        {community.description && <p>{truncate(community.description, 160)}</p>}
      </div>
    </a>
  );
}
export default CommunityCard;
