import { SerializedChannel } from '@linen/types';

export function sortByChannelName(
  channels: SerializedChannel[]
): SerializedChannel[] {
  return channels.sort((a, b) => {
    return a.channelName.localeCompare(b.channelName);
  });
}
