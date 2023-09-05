import { SerializedChannel } from '@linen/types';

export function findChannelOrGetLandingChannel(
  channels: SerializedChannel[],
  channelName?: string
) {
  if (channelName) {
    return channels.find(
      (c) => c.channelName === channelName || c.id === channelName
    );
  }
  const landingChannel = channels.find((c) => c.landing);
  if (landingChannel) return landingChannel;

  const defaultChannel = channels.find((c) => c.default);
  if (defaultChannel) return defaultChannel;

  return channels[0];
}
