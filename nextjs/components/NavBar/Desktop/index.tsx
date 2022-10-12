import { useState } from 'react';
import type { ChannelSerialized } from 'lib/channel';
import NavItem from './NavItem';
import NavLabel from './NavLabel';
import { Permissions } from 'types/shared';
import Link from 'components/Link/InternalLink';
import { NewChannelModal } from 'components/Channel';
import useWebsockets from 'hooks/websockets';
import { SerializedUser } from 'serializers/user';
import { toast } from 'components/Toast';
import Badge from 'components/Badge';
import styles from './index.module.scss';
import { FiBox, FiHash } from 'react-icons/fi';

interface Props {
  channels: ChannelSerialized[];
  currentUser?: SerializedUser | null;
  channelName: string;
  permissions: Permissions;
  token: string | null;
}

export default function DesktopNavBar({
  channelName,
  currentUser,
  channels,
  permissions,
  token,
}: Props) {
  const userId = currentUser?.authsId;

  const [highlights, setHighlights] = useState<string[]>([]);

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
          toast.info(`You were mentioned in #${channel.channelName}`);
        }
      }
      setHighlights((highlights) => {
        return [...highlights, payload.channel_id];
      });
    },
  });

  return (
    <div className={styles.navbar}>
      {permissions.feed && (
        <Link onClick={() => setHighlights([])} href="/feed">
          <NavItem>
            <FiBox className="mr-1" /> Feed
            {highlights.length > 0 && (
              <Badge className="ml-2">{highlights.length}</Badge>
            )}
          </NavItem>
        </Link>
      )}
      <NavLabel>
        <div className="grow">Channels</div>
        {permissions.channel_create && <NewChannelModal />}
      </NavLabel>
      <div className="block overflow-hidden hover:overflow-auto h-[calc(100vh-240px)]">
        {channels.map((channel: ChannelSerialized, index: number) => {
          const count = highlights.reduce((count: number, id: string) => {
            if (id === channel.id) {
              return count + 1;
            }
            return count;
          }, 0);
          return (
            <Link
              onClick={() => {
                setHighlights((highlights) => {
                  return highlights.filter((id) => id !== channel.id);
                });
              }}
              key={`${channel.channelName}-${index}`}
              href={`/c/${channel.channelName}`}
            >
              <NavItem active={channel.channelName === channelName}>
                <FiHash className="mr-1" /> {channel.channelName}
                {count > 0 && <Badge className="ml-2">{count}</Badge>}
              </NavItem>
            </Link>
          );
        })}
      </div>
      <a target="_blank" rel="noreferrer" href="https://www.linen.dev">
        <NavItem>Powered by Linen</NavItem>
      </a>
    </div>
  );
}
