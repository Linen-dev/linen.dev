import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { SerializedAccount } from '@linen/types';
import { pickTextColorBasedOnBgColor } from '@linen/utilities/colors';
import CommunityIcon from '@/CommunityIcon';

interface Props {
  className?: string;
  community: SerializedAccount;
  onClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
  getHomeUrl: (args: any) => string;
}

export default function CommunityLink({
  className,
  community,
  onClick,
  getHomeUrl,
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
      <CommunityIcon community={community} />
    </a>
  );
}
