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

interface Props {
  mode: Mode;
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  dms: SerializedChannel[];
  channelName: string;
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
  Image: (args: any) => JSX.Element;
  NewChannelModal: (args: any) => JSX.Element;
  NewCommunityModal: (args: any) => JSX.Element;
  NewDmModal: (args: any) => JSX.Element;
  archiveChannel: (args: any) => Promise<any>;
  post: (...args: any) => Promise<any>;
  put: (...args: any) => Promise<any>;
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
  Image,
  getHomeUrl,
  NewChannelModal,
  NewCommunityModal,
  NewDmModal,
  archiveChannel,
  post,
  put,
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
          {...{
            Link,
            routerAsPath,
            usePath,
            Image,
            getHomeUrl,
            NewChannelModal,
            NewCommunityModal,
            NewDmModal,
            archiveChannel,
            post,
            put,
            notify,
          }}
        />
      </div>
    </>
  );
}
