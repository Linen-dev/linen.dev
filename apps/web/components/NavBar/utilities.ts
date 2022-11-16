import type { ChannelSerialized } from 'lib/channel';

export function sortByChannelName(
  channels: ChannelSerialized[]
): ChannelSerialized[] {
  return channels.sort((a, b) => {
    if (a.channelName < b.channelName) {
      return -1;
    }
    if (a.channelName > b.channelName) {
      return 1;
    }
    return 0;
  });
}
