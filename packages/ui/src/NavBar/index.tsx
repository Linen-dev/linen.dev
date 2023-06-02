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
  currentChannel?: SerializedChannel;
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
  getHomeUrl: (community: SerializedAccount) => string;
  api: ApiClient;
  CustomRouterPush({ path }: { path: string }): void;
  notify: (...args: any) => any;
  CustomLink?: (props: {
    href: string;
    className: string;
    onClick: ((event: React.MouseEvent<HTMLAnchorElement>) => void) | undefined;
    children: JSX.Element;
  }) => JSX.Element;
}

export default function NavBar({
  mode,
  currentCommunity,
  currentChannel,
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
  api,
  notify,
  CustomRouterPush,
  CustomLink,
}: Props) {
  const sortedChannels = sortByChannelName(channels);

  return (
    <>
      <div className={styles.desktop}>
        <DesktopNavBar
          key={permissions.user?.id}
          mode={mode}
          currentCommunity={currentCommunity}
          currentChannel={currentChannel}
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
          notify={notify}
          api={api}
          CustomRouterPush={CustomRouterPush}
          CustomLink={CustomLink}
        />
      </div>
    </>
  );
}
