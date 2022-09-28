import type { ChannelSerialized } from 'lib/channel';
import ChannelName from './ChannelName';
import ChannelSelect from './ChannelSelect';
import { sortByChannelName } from './utilities';
import { Permissions } from 'types/shared';
import Link from 'components/Link/InternalLink';
import { NewChannelModal } from 'components/Channel';

export default function NavBar({
  channelName,
  channels,
  permissions,
}: {
  channels: ChannelSerialized[];
  channelName: string;
  permissions: Permissions;
}) {
  const sortedChannels = sortByChannelName(channels);

  const navBarLg = (
    <div className="pl-2 w-[250px] pt-4 bg-slate-50">
      {permissions.feed && (
        <h5 style={{ fontWeight: 'bold', paddingLeft: 18, marginBottom: 8 }}>
          <Link href="/feed">Feed</Link>
        </h5>
      )}
      <div className="flex px-[18px] mb-2">
        <span className="grow font-bold">Channels</span>
        {permissions.channel_create && <NewChannelModal />}
      </div>
      <div className="block overflow-hidden hover:overflow-auto h-[calc(100vh-240px)]">
        {sortedChannels.map((c: ChannelSerialized) => (
          <Link key={c.channelName} href={`/c/${c.channelName}`}>
            <div className="text-gray-800">
              <ChannelName
                name={c.channelName}
                active={c.channelName === channelName}
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
