import { SerializedAccount } from '@linen/types';
import React, { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { pickTextColorBasedOnBgColor } from '@linen/utilities/colors';
import preload from '@/Image/utilities/preload';

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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoaded(false);
    if (community.logoSquareUrl) {
      preload(community.logoSquareUrl)
        .then(() => {
          if (mounted) {
            setLoaded(true);
          }
        })
        .catch((exception) => {
          if (mounted) {
            setLoaded(false);
          }
        });
    }
    return () => {
      mounted = false;
    };
  }, []);

  if (community.logoSquareUrl && loaded) {
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
  const backgroundColor = community.brandColor || 'black';
  const fontColor = pickTextColorBasedOnBgColor(
    backgroundColor,
    'white',
    'black'
  );
  return (
    <div
      className={styles.icon}
      style={{ color: fontColor, background: backgroundColor }}
    >
      {getLetter(community.name)}
    </div>
  );
}
