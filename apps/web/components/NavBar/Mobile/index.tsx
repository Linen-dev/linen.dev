import React from 'react';
import classNames from 'classnames';
import { FiInbox } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Link from 'components/Link/InternalLink';
import { Nav } from '@linen/ui';
import ChannelSelect from './ChannelSelect';
import { Permissions, SerializedChannel } from '@linen/types';
import usePath from 'hooks/path';
import styles from './index.module.scss';

interface Props {
  channelName: string;
  channels: SerializedChannel[];
  permissions: Permissions;
}

export default function MobileNavBar({
  channels,
  permissions,
  channelName,
}: Props) {
  const router = useRouter();
  const paths = {
    inbox: usePath({ href: '/inbox' }),
  };

  return (
    <Nav
      className={classNames(styles.container, {
        [styles.list]: permissions.inbox,
      })}
    >
      {permissions.inbox && (
        <Link className={styles.item} href="/inbox">
          <Nav.Item
            className={styles.inbox}
            active={paths.inbox === router.asPath}
          >
            <FiInbox className="mr-1" /> Inbox
          </Nav.Item>
        </Link>
      )}
      <ChannelSelect
        className={styles.item}
        channels={channels}
        value={channelName}
      />
    </Nav>
  );
}
