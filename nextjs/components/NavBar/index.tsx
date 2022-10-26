import type { ChannelSerialized } from 'lib/channel';
import { sortByChannelName } from './utilities';
import { Permissions } from 'types/shared';
import DesktopNavBar from './Desktop';
import MobileNavBar from './Mobile';
import { Mode } from 'hooks/mode';

interface Props {
  mode: Mode;
  channels: ChannelSerialized[];
  channelName: string;
  permissions: Permissions;
}

export default function NavBar({
  mode,
  channelName,
  channels,
  permissions,
}: Props) {
  const sortedChannels = sortByChannelName(channels);

  return (
    <>
      <div className="hidden lg:flex">
        <DesktopNavBar
          mode={mode}
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
