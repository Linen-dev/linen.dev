import React from 'react';
import classNames from 'classnames';
import CommunityIcon from '@/CommunityIcon';
import styles from './index.module.scss';
import type { SerializedAccount } from '@linen/types';
import { truncate } from '@linen/utilities/string';
import { getHomeUrl } from '@linen/utilities/home';

function CommunityCard({
  className,
  community,
}: {
  className?: string;
  community: SerializedAccount;
}) {
  if (community.logoUrl) {
    return (
      <a
        className={classNames(styles.logo, className)}
        style={{
          backgroundColor: community.brandColor,
        }}
        href={getHomeUrl(community)}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={community.logoUrl as string}
          alt="Logo"
          height="50"
          width="200"
        />
      </a>
    );
  }
  return (
    <a
      href={getHomeUrl(community)}
      className={classNames(styles.card, className)}
      target="_blank"
    >
      <CommunityIcon community={community} />
      <div className={styles.content}>
        <h2>{community.name}</h2>
        {community.description && <p>{truncate(community.description, 160)}</p>}
      </div>
    </a>
  );
}
export default CommunityCard;
