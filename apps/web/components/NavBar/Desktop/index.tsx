import { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Permissions,
  SerializedChannel,
  SerializedReadStatus,
} from '@linen/types';
import Link from 'components/Link/InternalLink';
import NewChannelModal from 'components/Pages/Channel/Content/NewChannelModal';
import useWebsockets from '@linen/hooks/websockets';
import styles from './index.module.scss';
import { FiRss, FiBarChart, FiHash, FiSettings, FiSliders, FiDollarSign, FiUsers } from 'react-icons/fi';
import { useRouter } from 'next/router';
import usePath from 'hooks/path';
import { Mode } from '@linen/hooks/mode';
import { Nav, Toast } from '@linen/ui';
import debounce from '@linen/utilities/debounce';
import { post } from 'utilities/http';
import { notify } from 'utilities/notification';
import unique from 'lodash.uniq';

interface Props {
  mode: Mode;
  channels: SerializedChannel[];
  channelName: string;
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

export default function DesktopNavBar({
  mode,
  channelName,
  channels,
  permissions,
  onDrop,
}: Props) {
  const [highlights, setHighlights] = useState<string[]>([]);
  const router = useRouter();

  const userId = permissions.auth?.id || null;
  const token = permissions.token || null;

  useWebsockets({
    room: userId && `user:${userId}`,
    permissions,
    token,
    onNewMessage(payload) {
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
    },
  });

  const currentUser = permissions.user || null;

  useEffect(() => {
    let mounted = true;
    if (currentUser) {
      debouncedReadStatus({ channelIds: channels.map(({ id }) => id) }).then(
        ({ readStatuses }: { readStatuses: SerializedReadStatus[] }) => {
          if (mounted) {
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

  const paths = {
    feed: usePath({ href: '/feed' }),
    metrics: usePath({ href: '/metrics' }),
    settings: usePath({ href: '/settings' }),
    branding: usePath({ href: '/branding' }),
    members: usePath({ href: '/members' }),
    plans: usePath({ href: '/plans' })
  };

  return (
    <Nav className={styles.navbar}>
      {permissions.feed && (
        <Link href="/feed">
          <Nav.Item active={paths.feed === router.asPath}>
            <FiRss /> Feed
          </Nav.Item>
        </Link>
      )}
      {permissions.manage && (
        <Link href="/metrics">
          <Nav.Item active={paths.metrics === router.asPath}>
            <FiBarChart /> Metrics
          </Nav.Item>
        </Link>
      )}
      {permissions.manage && (
        <Link href="/settings">
          <Nav.Item active={paths.settings === router.asPath}>
            <FiSettings /> Settings
          </Nav.Item>
        </Link>
      )}
      {permissions.manage && (
        <Link href="/branding">
          <Nav.Item active={paths.branding === router.asPath}>
            <FiSliders /> Branding
          </Nav.Item>
        </Link>
      )}
      {permissions.manage && (
        <Link href="/members">
          <Nav.Item active={paths.members === router.asPath}>
            <FiUsers /> Members
          </Nav.Item>
        </Link>
      )}
      {permissions.manage && (
        <Link href="/plans">
          <Nav.Item active={paths.plans === router.asPath}>
            <FiDollarSign /> Plans
          </Nav.Item>
        </Link>
      )}
      <Nav.Label>
        <div className="grow">Channels</div>
        {permissions.channel_create && !!permissions.accountId && (
          <NewChannelModal communityId={permissions.accountId} />
        )}
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
            event.currentTarget.classList.add(styles.hover);
          }

          function handleDragLeave(event: React.DragEvent) {
            event.currentTarget.classList.remove(styles.hover);
          }

          const active = channel.channelName === channelName;
          const highlighted = !active && count > 0;

          return (
            <Link
              className={classNames(styles.item, {
                [styles.dropzone]: mode === Mode.Drag,
              })}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                setHighlights((highlights) => {
                  return highlights.filter((id) => id !== channel.id);
                });
              }}
              key={`${channel.channelName}-${index}`}
              href={`/c/${channel.channelName}`}
            >
              <Nav.Item active={active} highlighted={highlighted}>
                <FiHash /> {channel.channelName}
              </Nav.Item>
            </Link>
          );
        })}
      </div>
      <a target="_blank" rel="noreferrer" href="https://www.linen.dev">
        <Nav.Item>Powered by Linen</Nav.Item>
      </a>
    </Nav>
  );
}
