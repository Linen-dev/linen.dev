import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { SerializedAccount } from '@linen/types';
import CommunityIcon from '@/CommunityIcon';
import Tooltip from '@/Tooltip';

interface Props {
  className?: string;
  community: SerializedAccount;
  onClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
  getHomeUrl: (args: any) => string;
  selected: boolean;
}

export default function CommunityLink({
  className,
  community,
  onClick,
  getHomeUrl,
  selected,
}: Props) {
  const href = getHomeUrl(community);
  if (href === '/') return <></>;

  return (
    <Tooltip text={community.name || 'Community'} position="right">
      <a
        href={href}
        className={classNames(styles.link, className, {
          [styles.selected]: selected,
        })}
        onClick={onClick}
      >
        <CommunityIcon community={community} />
      </a>
    </Tooltip>
  );
}
