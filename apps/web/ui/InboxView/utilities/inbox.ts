import {
  InboxChannelConfig,
  InboxConfig,
  SerializedChannel,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';

export function defaultConfiguration({
  channels,
}: {
  channels: SerializedChannel[];
}): InboxConfig {
  const configuration = localStorage.get('inbox.configuration') as InboxConfig;
  if (configuration && configuration.channels) {
    const result: InboxChannelConfig[] = [];
    channels.forEach((channel) => {
      const saved = configuration.channels.find(
        ({ channelId }) => channelId === channel.id
      );
      if (saved) {
        result.push(saved);
      } else {
        result.push({
          channelId: channel.id,
          subscribed: true,
        });
      }
    });
    return {
      channels: result,
    };
  }
  return {
    channels: channels.map((channel: SerializedChannel) => {
      return {
        channelId: channel.id,
        subscribed: true,
      };
    }),
  };
}
