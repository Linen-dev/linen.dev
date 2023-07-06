import { prisma } from '@linen/database';

(async function () {
  const result = await prisma.channels.updateMany({
    where: {
      channelName: 'default',
    },
    data: { channelName: 'main' },
  });
  console.log('result', result);
})();
