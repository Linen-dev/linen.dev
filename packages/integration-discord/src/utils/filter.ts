import type { Message, Channel } from 'discord.js';
import { supportedChannelTypes } from './constrains';

export function filterMessageType(message: Message) {
  return ![0].includes(message.type);
}
export function filterSupportedChannel(channel: Channel) {
  return !supportedChannelTypes.includes(channel.type);
}
