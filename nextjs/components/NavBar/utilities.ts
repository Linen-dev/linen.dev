import { channels } from '@prisma/client';

export function sortByChannelName(channels: channels[]): channels[] {
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
