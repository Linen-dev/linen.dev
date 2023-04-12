import { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
} from '@linen/types';
import Link from 'components/Link/InternalLink';
import useWebsockets from '@linen/hooks/websockets';
import styles from './index.module.scss';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { FiSliders } from '@react-icons/all-files/fi/FiSliders';
import { FiZap } from '@react-icons/all-files/fi/FiZap';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { useRouter } from 'next/router';
import usePath from 'hooks/path';
import { Mode } from '@linen/hooks/mode';
import Toast from '@linen/ui/Toast';
import Nav from '@linen/ui/Nav';
import debounce from '@linen/utilities/debounce';
import { post, put } from 'utilities/http';
import { notify } from 'utilities/notification';
import unique from 'lodash.uniq';
import CommunityLink from './CommunityLink';
import AddCommunityLink from './AddCommunityLink';
import NewCommunityModal from 'components/Modals/NewCommunityModal';
import { timestamp } from '@linen/utilities/date';
import { DMs } from './DMs';
import useInboxWebsockets from '@linen/hooks/websockets/inbox';
import MenuGroup from './MenuGroup';
import ChannelsGroup from './ChannelsGroup';
import MenuIcon from './MenuIcon';
import PoweredByLinen from './PoweredByLinen';
import AnalyticsGroup from './AnalyticsGroup';

interface Props {
  mode: Mode;
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
}

const debouncedReadStatus = debounce(
  ({ channelIds }: { channelIds: string[] }) =>
    post('/api/read-status', { channelIds })
);

const debouncedUpdateReadStatus = debounce(
  (channelId: string): Promise<SerializedReadStatus> =>
    put(`/api/read-status/${channelId}`, { timestamp: timestamp() })
);

export default function DesktopNavBar({
  mode,
  channelName,
  channels,
  communities,
  permissions,
  dms,
  onDrop,
}: Props) {
  const router = useRouter();
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
    ].includes(router.asPath);
  };

  const currentUser = permissions.user || null;
  const userId = permissions.auth?.id || null;
  const token = permissions.token || null;

  const [highlights, setHighlights] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(!currentUser);
  const [showSettings, toggleSettings] = useState(isSettingsPath());
  const [modal, setModal] = useState(false);

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
        {currentUser && (
          <>
            {communities?.map((community) => {
              return <CommunityLink key={community.id} community={community} />;
            })}
          </>
        )}
        {currentUser && (
          <>
            <AddCommunityLink onClick={() => setModal(true)} />
            <NewCommunityModal open={modal} close={() => setModal(false)} />
          </>
        )}
      </div>
      <div
        className={classNames(styles.animation, {
          [styles.collapsed]: collapsed,
        })}
      >
        <Nav className={styles.navbar}>
          <MenuGroup
            currentUser={currentUser}
            currentUrl={router.asPath}
            permissions={permissions}
            paths={paths}
          />
          <ChannelsGroup
            channelName={channelName}
            channels={channels}
            currentUser={currentUser}
            highlights={highlights}
            mode={mode}
            permissions={permissions}
            onChannelClick={(channelId) => {
              debouncedUpdateReadStatus(channelId);
              setHighlights((highlights) => {
                return highlights.filter((id) => id !== channelId);
              });
            }}
            onDrop={onDrop}
          />
          {currentUser && permissions.chat && (
            <DMs
              {...{
                channelName,
                debouncedUpdateReadStatus,
                dms,
                highlights,
                permissions,
                setHighlights,
              }}
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
                <Nav.Item active={paths.configurations === router.asPath}>
                  <FiSettings /> Configurations
                </Nav.Item>
              </Link>
              <Link href="/branding">
                <Nav.Item active={paths.branding === router.asPath}>
                  <FiSliders /> Branding
                </Nav.Item>
              </Link>
              <Link href="/members">
                <Nav.Item active={paths.members === router.asPath}>
                  <FiUsers /> Members
                </Nav.Item>
              </Link>
              <Link href="/plans">
                <Nav.Item active={paths.plans === router.asPath}>
                  <FiZap /> Plans
                </Nav.Item>
              </Link>
            </>
          )}
          <AnalyticsGroup
            currentUser={currentUser}
            currentUrl={router.asPath}
            permissions={permissions}
            paths={paths}
          />
          <PoweredByLinen />
        </Nav>
      </div>
    </div>
  );
}
