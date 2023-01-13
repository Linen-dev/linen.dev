import React from 'react';
import styles from './index.module.scss';
import { SerializedAccount } from '@linen/types';
import { getHomeUrl } from 'utilities/home';
import { pickTextColorBasedOnBgColor } from 'utilities/colors';
import Image from 'next/image';

interface Props {
  community: SerializedAccount;
}

function getLetter(name?: string) {
  if (!name || name.length === 0) {
    return 'C';
  }
  return name.trim().toUpperCase().charAt(0);
}

export default function CommunityLink({ community }: Props) {
  const backgroundColor = community.brandColor || 'black';
  const fontColor = pickTextColorBasedOnBgColor(
    backgroundColor,
    'white',
    'black'
  );

  return (
    <a
      href={getHomeUrl(community)}
      className={styles.link}
      style={
        community.logoSquareUrl
          ? undefined
          : { color: fontColor, background: backgroundColor }
      }
    >
      {community.logoSquareUrl ? (
        <Image
          src={community.logoSquareUrl}
          alt={community.description || community.name || 'Community'}
          width={36}
          height={36}
        />
      ) : (
        getLetter(community.name)
      )}
    </a>
  );
}
