import React from 'react';
import classNames from 'classnames';
import { FiRss } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Link from 'components/Link/InternalLink';
import NavItem from '../NavItem';
import type { ChannelSerialized } from 'lib/channel';
import ChannelSelect from './ChannelSelect';
import { Permissions } from 'types/shared';
import usePath from 'hooks/path';
import styles from './index.module.scss';

interface Props {
  channelName: string;
  channels: ChannelSerialized[];
  permissions: Permissions;
}

export default function MobileNavBar({
  channels,
  permissions,
  channelName,
}: Props) {
  const router = useRouter();
  const paths = {
    feed: usePath({ href: '/feed' }),
  };

  return (
    <div
      className={classNames(styles.container, {
        [styles.list]: permissions.feed,
      })}
    >
      {permissions.feed && (
        <Link className={styles.item} href="/feed">
          <NavItem active={paths.feed === router.asPath}>
            <FiRss className="mr-1" /> Feed
          </NavItem>
        </Link>
      )}
      <ChannelSelect
        className={styles.item}
        channels={channels}
        value={channelName}
      />
    </div>
  );
}
