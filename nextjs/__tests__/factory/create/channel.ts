import type { channels } from '@prisma/client';
import prisma from 'client';

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
