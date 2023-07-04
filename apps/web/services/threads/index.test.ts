jest.mock('services/events/eventThreadUpdated');
jest.mock('services/events/eventThreadReopened');
jest.mock('services/events/eventThreadClosed');
import { ThreadState } from '@linen/types';
import ThreadsServices from '.';
import { create } from '@linen/factory';

describe('ThreadsServices', () => {
  describe('update', () => {
    test('update the thread', async () => {
      const community = await create('account');
      const channel = await create('channel', {
        accountId: community.id,
      });
      const thread = await create('thread', {
        channelId: channel.id,
      });
      const data = await ThreadsServices.update({
        id: thread.id,
        state: ThreadState.CLOSE,
        title: 'baz',
        pinned: false,
      });
      expect(data.state).toEqual(ThreadState.CLOSE);
      expect(data.title).toEqual('baz');
      expect(data.slug).toEqual('baz');
      expect(data.pinned).toEqual(false);
    });
  });
});
