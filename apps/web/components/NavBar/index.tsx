import { sortByChannelName } from './utilities';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
} from '@linen/types';
import DesktopNavBar from './Desktop';
import MobileNavBar from './Mobile';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

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

export default function NavBar({
  mode,
  channelName,
  channels,
  communities,
  permissions,
  dms,
  onDrop,
}: Props) {
  const sortedChannels = sortByChannelName(channels);

  return (
    <>
      <div className={styles.desktop}>
        <DesktopNavBar
          mode={mode}
          channels={sortedChannels}
          channelName={channelName}
          communities={communities}
          permissions={permissions}
          onDrop={onDrop}
          dms={dms}
        />
      </div>
      <div className={styles.mobile}>
        <MobileNavBar
          channels={sortedChannels}
          channelName={channelName}
          permissions={permissions}
        />
      </div>
    </>
  );
}
