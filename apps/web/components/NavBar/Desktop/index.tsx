import { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
} from '@linen/types';
import Link from 'components/Link/InternalLink';
import NewChannelModal from 'components/Modals/NewChannelModal';
import useWebsockets from '@linen/hooks/websockets';
import styles from './index.module.scss';
import { FiInbox } from '@react-icons/all-files/fi/FiInbox';
import { FiStar } from '@react-icons/all-files/fi/FiStar';
import { FiBarChart } from '@react-icons/all-files/fi/FiBarChart';
import { FiHash } from '@react-icons/all-files/fi/FiHash';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import { FiSettings } from '@react-icons/all-files/fi/FiSettings';
import { FiSliders } from '@react-icons/all-files/fi/FiSliders';
import { FiDollarSign } from '@react-icons/all-files/fi/FiDollarSign';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FiFileText } from '@react-icons/all-files/fi/FiFileText';
import { useRouter } from 'next/router';
import usePath from 'hooks/path';
import { Mode } from '@linen/hooks/mode';
import { Nav, Toast } from '@linen/ui';
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
    metrics: usePath({ href: '/metrics' }),
    integrations: usePath({ href: '/integrations' }),
    configurations: usePath({ href: '/configurations' }),
    branding: usePath({ href: '/branding' }),
    members: usePath({ href: '/members' }),
    plans: usePath({ href: '/plans' }),
  };

  const isSettingsPath = () => {
    return [
      paths.integrations,
      paths.configurations,
      paths.branding,
      paths.members,
      paths.plans,
    ].includes(router.asPath);
  };

  const [highlights, setHighlights] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(isSettingsPath());
  const [modal, setModal] = useState(false);

  const userId = permissions.auth?.id || null;
  const token = permissions.token || null;

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

  const currentUser = permissions.user || null;

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
      {currentUser && (
        <div className={styles.switch}>
          {communities?.map((community) => {
            return <CommunityLink key={community.id} community={community} />;
          })}
          <AddCommunityLink onClick={() => setModal(true)} />
          <NewCommunityModal open={modal} close={() => setModal(false)} />
        </div>
      )}
      <Nav className={styles.navbar}>
        {permissions.inbox && (
          <Link href="/inbox">
            <Nav.Item active={paths.inbox === router.asPath}>
              <FiInbox /> Inbox
            </Nav.Item>
          </Link>
        )}
        {permissions.starred && (
          <Link href="/starred">
            <Nav.Item active={paths.starred === router.asPath}>
              <FiStar /> Starred
            </Nav.Item>
          </Link>
        )}
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
        <Nav.Label>
          Channels
          {currentUser &&
            permissions.channel_create &&
            !!permissions.accountId && <NewChannelModal {...{ permissions }} />}
        </Nav.Label>
        <div>
          {channels.map((channel: SerializedChannel, index: number) => {
            const count = highlights.reduce((count: number, id: string) => {
              if (id === channel.id) {
                return count + 1;
              }
              return count;
            }, 0);

            function handleDrop(event: React.DragEvent) {
              const id = channel.id;
              const text = event.dataTransfer.getData('text');
              const data = JSON.parse(text);
              if (data.id === id) {
                return event.stopPropagation();
              }
              return onDrop?.({
                source: data.source,
                target: 'channel',
                from: data.id,
                to: id,
              });
            }

            function handleDragEnter(event: React.DragEvent) {
              event.currentTarget.classList.add(styles.drop);
            }

            function handleDragLeave(event: React.DragEvent) {
              event.currentTarget.classList.remove(styles.drop);
            }

            const active = channel.channelName === channelName;
            const highlighted = !active && count > 0;

            const Icon = channel.type === 'PRIVATE' ? FiLock : FiHash;

            return (
              <Link
                className={classNames(styles.item, {
                  [styles.dropzone]: mode === Mode.Drag,
                })}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  debouncedUpdateReadStatus(channel.id);
                  setHighlights((highlights) => {
                    return highlights.filter((id) => id !== channel.id);
                  });
                }}
                key={`${channel.channelName}-${index}`}
                href={`/c/${channel.channelName}`}
              >
                <Nav.Item active={active} highlighted={highlighted}>
                  <Icon /> {channel.channelName}
                </Nav.Item>
              </Link>
            );
          })}
        </div>
        {permissions.manage && (
          <Nav.Label
            className={styles.label}
            onClick={() => setExpanded((expanded) => !expanded)}
          >
            Settings {expanded ? <FiChevronUp /> : <FiChevronDown />}
          </Nav.Label>
        )}
        {expanded && permissions.manage && (
          <>
            <Link href="/integrations">
              <Nav.Item active={paths.integrations === router.asPath}>
                <FiSettings /> Integrations
              </Nav.Item>
            </Link>
            <Link href="/configurations">
              <Nav.Item active={paths.configurations === router.asPath}>
                <FiFileText /> Configurations
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
                <FiDollarSign /> Plans
              </Nav.Item>
            </Link>
          </>
        )}
        {permissions.manage && (
          <Link href="/metrics">
            <Nav.Item active={paths.metrics === router.asPath}>
              <FiBarChart /> Metrics
            </Nav.Item>
          </Link>
        )}
        <a target="_blank" rel="noreferrer" href="https://www.linen.dev">
          <Nav.Item>Powered by Linen</Nav.Item>
        </a>
      </Nav>
    </div>
  );
}
