import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Permissions, SerializedChannel, SerializedReadStatus } from '@linen/types';
import Link from 'components/Link/InternalLink';
import NewChannelModal from 'components/Pages/Channel/Content/NewChannelModal';
import useWebsockets from '@linen/hooks/websockets';
import styles from './index.module.scss';
import { FiRss, FiBarChart, FiHash } from 'react-icons/fi';
import { useRouter } from 'next/router';
import usePath from 'hooks/path';
import { Mode } from '@linen/hooks/mode';
import { Badge, Nav, Toast } from '@linen/ui';
import { get, put } from 'utilities/http';
import { timestamp } from '@linen/utilities/date'
import unique from 'lodash.uniq'

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
          Toast.info(`You were mentioned in #${channel.channelName}`);
        }
      }
      setHighlights((highlights) => {
        return [...highlights, payload.channel_id];
      });
    },
  });

  const currentUser = permissions.user || null

  useEffect(() => {
    let mounted = true
    if (currentUser) {
      Promise.all(channels.map(channel => {
        return get(`/api/read-status/${channel.id}`).then(status => {
          if (status || !mounted) { return Promise.resolve(status) }
          return put(`/api/read-status/${channel.id}`, { timestamp: timestamp() })
        })
      })).then(statuses => {
        if (mounted) {
          setHighlights(highlights => {
            const channelIds = statuses.filter((status: SerializedReadStatus) => {
              if (!status.lastReplyAt) { return false }
              return Number(status.lastReplyAt) > Number(status.lastReadAt)
            }).map((status) => status.channelId)
            return unique([...highlights, ...channelIds])
          })
        }
      })
    }
    return () => {
      mounted = false
    }
  }, [])

  const paths = {
    feed: usePath({ href: '/feed' }),
    metrics: usePath({ href: '/metrics' }),
  };

  return (
    <Nav className={styles.navbar}>
      {permissions.feed && (
        <Link onClick={() => setHighlights([])} href="/feed">
          <Nav.Item active={paths.feed === router.asPath}>
            <FiRss /> Feed
          </Nav.Item>
        </Link>
      )}
      {permissions.manage && (
        <Link onClick={() => setHighlights([])} href="/metrics">
          <Nav.Item active={paths.metrics === router.asPath}>
            <FiBarChart /> Metrics
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

          const active = channel.channelName === channelName
          const highlighted = !active && count > 0

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
