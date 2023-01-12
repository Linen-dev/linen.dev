import React from 'react';
import styles from './index.module.scss';
import { SerializedAccount } from '@linen/types';
import { getHomeUrl } from 'utilities/home';
import { pickTextColorBasedOnBgColor } from 'utilities/colors';

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
      style={{ color: fontColor, background: backgroundColor }}
    >
      {getLetter(community.name)}
    </a>
  );
}
