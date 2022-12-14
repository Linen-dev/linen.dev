import { prisma } from 'client';

export async function updateReadStatus({
  authId,
  channelId,
  timestamp,
}: {
  authId: string;
  channelId: string;
  timestamp: bigint;
}) {
  const data = { authId, channelId, lastReadAt: timestamp };
  return await prisma.readStatus.upsert({
    create: data,
    update: data,
    where: {
      authId_channelId: {
        authId,
        channelId,
      },
    },
  });
}

export async function getReadStatus({
  authId,
  channelId,
}: {
  authId: string;
  channelId: string;
}) {
  return await prisma.readStatus
    .findUnique({
      select: {
        channelId: true,
        lastReadAt: true,
        channel: {
          select: {
            threads: {
              orderBy: {
                sentAt: 'desc'
              },
              take: 1,
            }
          }
        }
      },
      where: {
        authId_channelId: {
          authId,
          channelId,
        },
      },
    })
}
