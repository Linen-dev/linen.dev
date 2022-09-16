import { channels } from '@prisma/client';
import ChannelName from './ChannelName';
import ChannelSelect from './ChannelSelect';
import { sortByChannelName } from './utilities';
import { isFeedEnabled } from 'utilities/featureFlags';
import { Permissions } from 'types/shared';
import Link from 'components/Link/InternalLink';

export default function NavBar({
  channelName,
  channels,
  permissions,
}: {
  channels: channels[];
  channelName: string;
  permissions: Permissions;
}) {
  const sortedChannels = sortByChannelName(channels);

  const navBarLg = (
    <div className="pl-2 w-[250px] pt-4 bg-slate-50">
      {isFeedEnabled && permissions.feed && (
        <h5 style={{ fontWeight: 'bold', paddingLeft: 18, marginBottom: 8 }}>
          <Link href="/feed">Feed</Link>
        </h5>
      )}
      <h5 style={{ fontWeight: 'bold', paddingLeft: 18, marginBottom: 8 }}>
        Channels
      </h5>
      <div className="block overflow-hidden hover:overflow-auto h-[calc(100vh-240px)]">
        {sortedChannels.map((c: channels) => (
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
    <div className="px-6">
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
