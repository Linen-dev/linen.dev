import React from 'react';
import { sortByChannelName } from './utilities';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
} from '@linen/types';
import DesktopNavBar from './Desktop';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';
import type { ApiClient } from '@linen/api-client';

interface Props {
  mode: Mode;
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  dms: SerializedChannel[];
  channelName?: string;
  communities: SerializedAccount[];
  permissions: Permissions;
  onDrop?({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    to: string;
    from: string;
  }): void;
  Link: (args: any) => JSX.Element;
  routerAsPath: string;
  usePath: (args: { href: string }) => string;
  getHomeUrl: (args: any) => string;
  NewChannelModal: (args: any) => JSX.Element;
  NewCommunityModal: (args: any) => JSX.Element;
  NewDmModal: (args: any) => JSX.Element;
  api: ApiClient;
  notify: (...args: any) => any;
}

export default function NavBar({
  mode,
  currentCommunity,
  channelName,
  channels,
  communities,
  permissions,
  dms,
  onDrop,
  Link,
  routerAsPath,
  usePath,
  getHomeUrl,
  NewChannelModal,
  NewCommunityModal,
  NewDmModal,
  api,
  notify,
}: Props) {
  const sortedChannels = sortByChannelName(channels);

  return (
    <>
      <div className={styles.desktop}>
        <DesktopNavBar
          mode={mode}
          currentCommunity={currentCommunity}
          channels={sortedChannels}
          channelName={channelName}
          communities={communities}
          permissions={permissions}
          onDrop={onDrop}
          dms={dms}
          // injection
          Link={Link}
          routerAsPath={routerAsPath}
          usePath={usePath}
          getHomeUrl={getHomeUrl}
          NewChannelModal={NewChannelModal}
          NewCommunityModal={NewCommunityModal}
          NewDmModal={NewDmModal}
          notify={notify}
          api={api}
        />
      </div>
    </>
  );
}
