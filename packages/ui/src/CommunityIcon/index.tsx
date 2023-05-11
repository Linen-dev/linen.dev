import { SerializedAccount } from '@linen/types';
import React from 'react';
import styles from './index.module.scss';

interface Props {
  community: SerializedAccount;
}

function getLetter(name?: string) {
  if (!name || name.length === 0) {
    return 'C';
  }
  return name.trim().toUpperCase().charAt(0);
}

export default function CommunityIcon({ community }: Props) {
  if (community.logoSquareUrl) {
    return (
      <img
        className={styles.icon}
        src={community.logoSquareUrl}
        alt={community.description || community.name || 'Community'}
        width={36}
        height={36}
      />
    );
  }
  return <div className={styles.icon}>{getLetter(community.name)}</div>;
}
