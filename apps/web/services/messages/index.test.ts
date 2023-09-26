import { ChatType } from '@linen/types';
import MessagesService from '.';
import { create } from '@linen/factory';

describe('MessagesService', () => {
  describe('create', () => {
    // validation was moved to controller
    it.skip('throws when the channel is readonly', async () => {
      const community = await create('account');
      const channel = await create('channel', {
        accountId: community.id,
        readonly: true,
      });
      const user = await create('user', {
        accountsId: community.id,
      });
      const thread = await create('thread', {
        channelId: channel.id,
      });

      await expect(
        MessagesService.create({
          body: 'foo',
          channelId: channel.id,
          userId: user.id,
          accountId: community.id,
          threadId: thread.id,
        })
      ).rejects.toThrow('channel is readonly');
    });
    // validation was moved to controller
    it.skip('throws when the channel is hidden', async () => {
      const community = await create('account');
      const channel = await create('channel', {
        accountId: community.id,
        hidden: true,
      });
      const user = await create('user', {
        accountsId: community.id,
      });
      const thread = await create('thread', {
        channelId: channel.id,
      });

      await expect(
        MessagesService.create({
          body: 'foo',
          channelId: channel.id,
          userId: user.id,
          accountId: community.id,
          threadId: thread.id,
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
      const thread = await create('thread', {
        channelId: channel.id,
      });

      await expect(
        MessagesService.create({
          body: 'foo',
          channelId: channel.id,
          userId: user.id,
          accountId: community.id,
          threadId: thread.id,
        })
      ).rejects.toThrow('chat is disabled');
    });
  });
});
