import type { ChannelSerialized } from 'lib/channel';
import { sortByChannelName } from './utilities';
import { Permissions } from 'types/shared';
import DesktopNavBar from './Desktop';
import MobileNavBar from './Mobile';

interface Props {
  channels: ChannelSerialized[];
  channelName: string;
  permissions: Permissions;
}

export default function NavBar({ channelName, channels, permissions }: Props) {
  const sortedChannels = sortByChannelName(channels);

  return (
    <>
      <div className="hidden lg:flex">
        <DesktopNavBar
          channels={sortedChannels}
          channelName={channelName}
          permissions={permissions}
        />
      </div>
      <div className="lg:hidden">
        <MobileNavBar
          channels={sortedChannels}
          channelName={channelName}
          permissions={permissions}
        />
      </div>
    </>
  );
}
