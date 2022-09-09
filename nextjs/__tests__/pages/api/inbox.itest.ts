import { index } from 'pages/api/inbox';
import prisma from 'client';
import setup from '__tests__/spec-helpers/integration';
import { ThreadState } from '@prisma/client';

setup({ truncationStrategy: 'none' });

describe('inbox', () => {
  describe('#index', () => {
    it('returns threads of given community', async () => {
      const account = await prisma.accounts.create({
        data: { name: 'foo', slackDomain: 'foo' },
      });
      const channel = await prisma.channels.create({
        data: {
          channelName: 'general',
          externalChannelId: '1234',
          accountId: account.id,
        },
      });
      const thread1 = await prisma.threads.create({
        data: {
          externalThreadId: '1234',
          sentAt: Date.now(),
          channelId: channel.id,
          state: ThreadState.OPEN,
        },
      });
      const thread2 = await prisma.threads.create({
        data: {
          externalThreadId: '5678',
          sentAt: Date.now(),
          channelId: channel.id,
          state: ThreadState.CLOSE,
        },
      });
      var { status, data } = await index({
        params: { communityName: 'foo', state: ThreadState.OPEN },
      });
      expect(status).toEqual(200);
      expect(data).toEqual({
        threads: [expect.objectContaining({ id: thread1.id })],
      });
      var { status, data } = await index({
        params: { communityName: 'foo', state: ThreadState.CLOSE },
      });
      expect(status).toEqual(200);
      expect(data).toEqual({
        threads: [expect.objectContaining({ id: thread2.id })],
      });
    });

    describe('when the community does not exist', () => {
      it('returns 404', async () => {
        const { status } = await index({ params: {} });
        expect(status).toEqual(404);
      });
    });
  });
});
