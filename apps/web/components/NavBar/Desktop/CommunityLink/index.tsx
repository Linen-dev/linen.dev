import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { SerializedAccount } from '@linen/types';
import { getHomeUrl } from 'utilities/home';
import { pickTextColorBasedOnBgColor } from 'utilities/colors';
import Image from 'next/image';

interface Props {
  className?: string;
  community: SerializedAccount;
  onClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
}

function getLetter(name?: string) {
  if (!name || name.length === 0) {
    return 'C';
  }
  return name.trim().toUpperCase().charAt(0);
}

export default function CommunityLink({
  className,
  community,
  onClick,
}: Props) {
  const backgroundColor = community.brandColor || 'black';
  const fontColor = pickTextColorBasedOnBgColor(
    backgroundColor,
    'white',
    'black'
  );

  const href = getHomeUrl(community);
  if (href === '/') return <></>;

  return (
    <a
      href={href}
      className={classNames(styles.link, className)}
      style={
        community.logoSquareUrl
          ? undefined
          : { color: fontColor, background: backgroundColor }
      }
      onClick={onClick}
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
