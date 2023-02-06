import { channels, prisma } from '@linen/database';

export default async function createChannel(
  options?: Partial<channels>
): Promise<channels> {
  return prisma.channels.create({
    data: {
      channelName: 'general',
      ...options,
    },
  });
}
