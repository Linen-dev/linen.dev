import type { ChannelSerialized } from 'lib/channel';
import { sortByChannelName } from './utilities';
import { Permissions } from 'types/shared';
import { SerializedUser } from 'serializers/user';
import DesktopNavBar from './Desktop';
import MobileNavBar from './Mobile';

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
  const sortedChannels = sortByChannelName(channels);

  return (
    <>
      <div className="hidden lg:flex bg-color-slate">
        <DesktopNavBar
          channels={sortedChannels}
          channelName={channelName}
          currentUser={currentUser}
          permissions={permissions}
          token={token}
        />
      </div>
      <div className="lg:hidden">
        <MobileNavBar channels={sortedChannels} channelName={channelName} />
      </div>
    </>
  );
}
