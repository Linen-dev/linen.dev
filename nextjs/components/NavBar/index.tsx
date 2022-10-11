import { useState } from 'react';
import type { ChannelSerialized } from 'lib/channel';
import ChannelName from './ChannelName';
import ChannelSelect from './ChannelSelect';
import { sortByChannelName } from './utilities';
import { Permissions } from 'types/shared';
import Link from 'components/Link/InternalLink';
import { NewChannelModal } from 'components/Channel';
import useWebsockets from 'hooks/websockets';
import { SerializedUser } from 'serializers/user';
import { toast } from 'components/Toast';
import Badge from 'components/Badge';

interface Props {
  channels: ChannelSerialized[];
  currentUser?: SerializedUser | null;
  channelName: string;
  permissions: Permissions;
  token: string | null;
}

export default function NavBar({
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

  const sortedChannels = sortByChannelName(channels);

  const navBarLg = (
    <div className="w-[250px] pt-4 bg-slate-50">
      {permissions.feed && (
        <h5 style={{ fontWeight: 'bold', paddingLeft: 18, marginBottom: 8 }}>
          <Link onClick={() => setHighlights([])} href="/feed">
            Feed
            {highlights.length > 0 && (
              <Badge className="ml-2">{highlights.length}</Badge>
            )}
          </Link>
        </h5>
      )}
      <div className="flex px-[18px] mb-2">
        <span className="grow font-bold">Channels</span>
        {permissions.channel_create && <NewChannelModal />}
      </div>
      <div className="block overflow-hidden hover:overflow-auto h-[calc(100vh-240px)]">
        {sortedChannels.map((channel: ChannelSerialized, index: number) => (
          <Link
            onClick={() => {
              setHighlights((highlights) => {
                return highlights.filter((id) => id !== channel.id);
              });
            }}
            key={`${channel.channelName}-${index}`}
            href={`/c/${channel.channelName}`}
          >
            <div className="text-gray-800">
              <ChannelName
                name={channel.channelName}
                count={highlights.reduce((count: number, id: string) => {
                  if (id === channel.id) {
                    return count + 1;
                  }
                  return count;
                }, 0)}
                active={channel.channelName === channelName}
              />
            </div>
          </Link>
        ))}
      </div>
      <a
        className="pl-4 text-gray-800 opacity-80 text-sm hover:text-blue-900 py-2"
        target="_blank"
        rel="noreferrer"
        href="https://www.linen.dev"
      >
        Powered by Linen
      </a>
    </div>
  );

  const navBarSm = (
    <div
      className="py-1"
      style={{
        borderTop: '1px solid #e5e7eb',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px #e5e7eb',
      }}
    >
      <ChannelSelect channels={sortedChannels} value={channelName} />
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex bg-color-slate">{navBarLg}</div>
      <div className="lg:hidden">{navBarSm}</div>
    </>
  );
}
