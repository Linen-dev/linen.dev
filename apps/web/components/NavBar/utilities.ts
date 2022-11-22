import { SerializedChannel } from '@linen/types';

export function sortByChannelName(
  channels: SerializedChannel[]
): SerializedChannel[] {
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
