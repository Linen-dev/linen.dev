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
  getHomeUrl: (community: SerializedAccount) => string;
  selected: boolean;
  CustomLink?: (props: {
    href: string;
    className: string;
    onClick: ((event: React.MouseEvent<HTMLAnchorElement>) => void) | undefined;
    children: JSX.Element;
  }) => JSX.Element;
}

export default function CommunityLink({
  className,
  community,
  onClick,
  getHomeUrl,
  selected,
  CustomLink,
}: Props) {
  const href = getHomeUrl(community);
  if (href === '/') return <></>;

  return (
    <Tooltip text={community.name || 'Community'} position="right">
      {CustomLink ? (
        <CustomLink
          href={href}
          className={classNames(styles.link, className, {
            [styles.selected]: selected,
          })}
          onClick={onClick}
        >
          <CommunityIcon community={community} />
        </CustomLink>
      ) : (
        <a
          href={href}
          className={classNames(styles.link, className, {
            [styles.selected]: selected,
          })}
          onClick={onClick}
        >
          <CommunityIcon community={community} />
        </a>
      )}
    </Tooltip>
  );
}
