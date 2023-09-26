import { ChatType, ThreadState } from '@linen/types';
import ThreadsServices from '.';
import { create } from '@linen/factory';

describe('ThreadsServices', () => {
  describe('create', () => {
    it('throws when the channel is readonly', async () => {
      const community = await create('account');
      const channel = await create('channel', {
        accountId: community.id,
        readonly: true,
      });
      const user = await create('user', {
        accountsId: community.id,
      });

      await expect(
        ThreadsServices.create({
          title: 'baz',
          body: 'foo',
          channelId: channel.id,
          authorId: user.id,
          accountId: community.id,
        })
      ).rejects.toThrow('channel is readonly');
    });

    it('throws when the channel is hidden', async () => {
      const community = await create('account');
      const channel = await create('channel', {
        accountId: community.id,
        hidden: true,
      });
      const user = await create('user', {
        accountsId: community.id,
      });

      await expect(
        ThreadsServices.create({
          title: 'baz',
          body: 'foo',
          channelId: channel.id,
          authorId: user.id,
          accountId: community.id,
        })
      ).rejects.toThrow('channel is hidden');
    });

    it('throws when the community has disabled the chat', async () => {
      const community = await create('account', {
        chat: ChatType.NONE,
      });
      const channel = await create('channel', {
        accountId: community.id,
      });
      const user = await create('user', {
        accountsId: community.id,
      });

      await expect(
        ThreadsServices.create({
          title: 'baz',
          body: 'foo',
          channelId: channel.id,
          authorId: user.id,
          accountId: community.id,
        })
      ).rejects.toThrow('chat is disabled');
    });
  });
  describe('update', () => {
    it('update the thread', async () => {
      const community = await create('account');
      const channel = await create('channel', {
        accountId: community.id,
        readonly: false,
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
      expect(data!.state).toEqual(ThreadState.CLOSE);
      expect(data!.title).toEqual('baz');
      expect(data!.slug).toEqual('baz');
      expect(data!.pinned).toEqual(false);
    });
  });
});
