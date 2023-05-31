import React from 'react';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
} from '@linen/types';
import useWebsockets from '@linen/hooks/websockets';
import styles from './index.module.scss';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { FiSliders } from '@react-icons/all-files/fi/FiSliders';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { Mode } from '@linen/hooks/mode';
import Toast from '@/Toast';
import Nav from '@/Nav';
import debounce from '@linen/utilities/debounce';
import unique from 'lodash.uniq';
import CommunityLink from '@/CommunityLink';
import AddCommunityLink from './AddCommunityLink';
import FindCommunityLink from './FindCommunityLink';
import { timestamp } from '@linen/utilities/date';
import { DMs } from './DMs';
import useInboxWebsockets from '@linen/hooks/websockets-inbox';
import MenuGroup from './MenuGroup';
import ChannelsGroup from './ChannelsGroup';
import MenuIcon from './MenuIcon';
import PoweredByLinen from '@/PoweredByLinen';
import AnalyticsGroup from './AnalyticsGroup';
import EditChannelModal from '@/EditChannelModal';
import type { ApiClient } from '@linen/api-client';
import NewCommunityModal from '@/NewCommunityModal';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';

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
  notify: (...args: any) => any;
  api: ApiClient;
  CustomRouterPush({ path }: { path: string }): void;
}

enum ModalView {
  NONE,
  EDIT_CHANNEL,
  NEW_COMMUNITY,
}

export default function DesktopNavBar({
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
  notify,
  api,
  CustomRouterPush,
}: Props) {
  const paths = {
    inbox: usePath({ href: '/inbox' }),
    starred: usePath({ href: '/starred' }),
    all: usePath({ href: '/all' }),
    metrics: usePath({ href: '/metrics' }),
    configurations: usePath({ href: '/configurations' }),
    branding: usePath({ href: '/branding' }),
    members: usePath({ href: '/members' }),
    plans: usePath({ href: '/plans' }),
  };

  const isSettingsPath = () => {
    return [
      paths.configurations,
      paths.branding,
      paths.members,
      paths.plans,
    ].includes(routerAsPath);
  };

  const debouncedReadStatus = debounce(api.postReadStatus);

  const debouncedUpdateReadStatus = debounce(api.updateReadStatus);

  const currentUser = permissions.user || null;
  const userId = permissions.auth?.id || null;
  const token = permissions.token || null;

  const [highlights, setHighlights] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(!userId);
  const [showSettings, toggleSettings] = useState(isSettingsPath());
  const [modal, setModal] = useState<ModalView>(ModalView.NONE);
  const [editedChannel, setEditedChannel] = useState<SerializedChannel>();

  const onNewMessage = (payload: any) => {
    if (payload.is_thread) {
      const thread = JSON.parse(payload.thread);
      if (
        thread?.messages?.length &&
        thread?.messages[0]?.author?.authsId === userId
      ) {
        return; // skip own messages
      }
    }
    if (payload.is_reply) {
      const message = JSON.parse(payload.message);
      if (message?.author?.authsId === userId) {
        return; // skip own messages
      }
    }
    if (payload.mention_type === 'signal') {
      const channel = channels.find(
        (channel) => channel.id === payload.channel_id
      );
      if (channel) {
        const text = `You were mentioned in #${channel.channelName}`;
        Toast.info(text);
        notify(text);
      }
    }
    setHighlights((highlights) => {
      return [...highlights, payload.channel_id];
    });
  };

  // useEffect(() => {
  //   let mounted = true;
  //   setTimeout(() => {
  //     onNewMessage({
  //       mention_type: 'signal',
  //       channel_id: channels[0].id,
  //     });
  //   }, 1000);
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  useWebsockets({
    room: userId && `user:${userId}`,
    permissions,
    token,
    onNewMessage,
  });

  useInboxWebsockets({
    communityId: permissions.accountId!,
    token,
    permissions,
    onNewMessage,
  });

  useEffect(() => {
    let mounted = true;
    if (currentUser) {
      debouncedReadStatus({ channelIds: channels.map(({ id }) => id) }).then(
        ({ readStatuses }: { readStatuses: SerializedReadStatus[] }) => {
          if (mounted && readStatuses?.length > 0) {
            setHighlights((highlights) => {
              const channelIds = readStatuses
                .filter(({ read }) => !read)
                .map(({ channelId }) => channelId);
              return unique([...highlights, ...channelIds]);
            });
          }
        }
      );
    }
    return () => {
      mounted = false;
    };
  }, [channelName]);

  return (
    <div className={styles.container}>
      <div className={styles.switch}>
        <MenuIcon onClick={() => setCollapsed((collapsed) => !collapsed)} />
        {userId && (
          <>
            {communities?.map((community) => {
              return (
                <CommunityLink
                  key={community.id}
                  community={community}
                  getHomeUrl={getHomeUrl}
                  selected={currentCommunity.id === community.id}
                />
              );
            })}
          </>
        )}
        {userId && (
          <>
            <AddCommunityLink
              onClick={() => setModal(ModalView.NEW_COMMUNITY)}
            />
            <NewCommunityModal
              open={modal === ModalView.NEW_COMMUNITY}
              close={() => setModal(ModalView.NONE)}
              api={api}
            />
          </>
        )}
        <FindCommunityLink />
      </div>
      <div
        className={classNames(styles.animation, {
          [styles.collapsed]: collapsed,
        })}
      >
        <Nav className={styles.navbar}>
          <div>
            <MenuGroup
              currentUser={currentUser}
              currentUrl={routerAsPath}
              permissions={permissions}
              paths={paths}
              Link={Link}
            />
            <ChannelsGroup
              channelName={channelName}
              channels={channels}
              currentUser={currentUser}
              highlights={highlights}
              mode={mode}
              permissions={permissions}
              onChannelClick={(channelId) => {
                debouncedUpdateReadStatus(channelId, timestamp());
                setHighlights((highlights) => {
                  return highlights.filter((id) => id !== channelId);
                });
              }}
              onSettingsClick={(channelId) => {
                const channel = channels.find(({ id }) => id === channelId);
                setEditedChannel(channel);
                setModal(ModalView.EDIT_CHANNEL);
              }}
              onDrop={onDrop}
              Link={Link}
              api={api}
              CustomRouterPush={CustomRouterPush}
            />
            {currentUser && permissions.chat && (
              <DMs
                channelName={channelName}
                debouncedUpdateReadStatus={debouncedUpdateReadStatus}
                dms={dms}
                highlights={highlights}
                permissions={permissions}
                setHighlights={setHighlights}
                Link={Link}
                api={api}
                CustomRouterPush={CustomRouterPush}
              />
            )}
            {permissions.manage && (
              <Nav.Group
                onClick={() => toggleSettings((showSettings) => !showSettings)}
              >
                Settings {showSettings ? <FiChevronUp /> : <FiChevronDown />}
              </Nav.Group>
            )}
            {showSettings && permissions.manage && (
              <>
                <Link href="/configurations">
                  <Nav.Item active={paths.configurations === routerAsPath}>
                    <FiSettings /> Configurations
                  </Nav.Item>
                </Link>
                <Link href="/branding">
                  <Nav.Item active={paths.branding === routerAsPath}>
                    <FiSliders /> Branding
                  </Nav.Item>
                </Link>
                <Link href="/members">
                  <Nav.Item active={paths.members === routerAsPath}>
                    <FiUsers /> Members
                  </Nav.Item>
                </Link>
                <Link href="/plans">
                  <Nav.Item active={paths.plans === routerAsPath}>
                    <FiZap /> Plans
                  </Nav.Item>
                </Link>
              </>
            )}
            <AnalyticsGroup
              currentUser={currentUser}
              currentUrl={routerAsPath}
              permissions={permissions}
              paths={paths}
              Link={Link}
            />
          </div>
          {!currentUser && <PoweredByLinen />}
        </Nav>
      </div>
      {editedChannel && (
        <EditChannelModal
          api={api}
          open={modal === ModalView.EDIT_CHANNEL}
          close={() => setModal(ModalView.NONE)}
          channel={editedChannel}
          currentCommunity={currentCommunity}
        />
      )}
    </div>
  );
}
