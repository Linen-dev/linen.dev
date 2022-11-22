import { update } from 'pages/api/threads/[id]';
import { build } from '__tests__/factory';
import prisma from 'client';
import { SerializedThread, ThreadState } from '@linen/types';

describe('update', () => {
  describe('when the user has manage permissions', () => {
    it('allows the user to update the thread', async () => {
      const permissions = build('permissions', { manage: true });
      const community = await prisma.accounts.create({
        data: { name: 'foo ' },
      });
      const channel = await prisma.channels.create({
        data: { accountId: community.id, channelName: 'bar' },
      });
      const thread = await prisma.threads.create({
        data: { channelId: channel.id, sentAt: new Date().getTime() },
      });
      const result = await update({
        permissions,
        params: {
          threadId: thread.id,
          state: ThreadState.CLOSE,
          title: 'baz',
          pinned: false,
        },
      });
      const { status, data } = result as {
        status: number;
        data: SerializedThread;
      };
      expect(status).toEqual(200);
      expect(data.state).toEqual(ThreadState.CLOSE);
      expect(data.title).toEqual('baz');
      expect(data.pinned).toEqual(false);
    });
  });

  describe('when the user does not have manage permissions', () => {
    describe('and the user is the creator of the thread', () => {
      it('allows the user to update the state and title of the thread', async () => {
        const community = await prisma.accounts.create({
          data: { name: 'foo ' },
        });
        const channel = await prisma.channels.create({
          data: { accountId: community.id, channelName: 'bar' },
        });
        const thread = await prisma.threads.create({
          data: { channelId: channel.id, sentAt: new Date().getTime() },
        });
        const user = await prisma.users.create({
          data: {
            isBot: false,
            isAdmin: false,
            accountsId: community.id,
          },
        });
        await prisma.messages.create({
          data: {
            threadId: thread.id,
            channelId: channel.id,
            body: 'message',
            sentAt: new Date(),
            usersId: user.id,
          },
        });
        const permissions = build('permissions', { manage: false, user });
        const result = await update({
          permissions,
          params: {
            threadId: thread.id,
            state: ThreadState.CLOSE,
            title: 'baz',
            pinned: true,
          },
        });
        const { status, data } = result as {
          status: number;
          data: SerializedThread;
        };
        expect(status).toEqual(200);
        expect(data.state).toEqual(ThreadState.CLOSE);
        expect(data.title).toEqual('baz');
        expect(data.pinned).toEqual(false);
      });
    });

    describe('and the user is not the creator of the thread', () => {
      it('does not allow the user to update the thread', async () => {
        const community = await prisma.accounts.create({
          data: { name: 'foo ' },
        });
        const channel = await prisma.channels.create({
          data: { accountId: community.id, channelName: 'bar' },
        });
        const thread = await prisma.threads.create({
          data: { channelId: channel.id, sentAt: new Date().getTime() },
        });
        const user1 = await prisma.users.create({
          data: {
            isBot: false,
            isAdmin: false,
            accountsId: community.id,
          },
        });
        const user2 = await prisma.users.create({
          data: {
            isBot: false,
            isAdmin: false,
            accountsId: community.id,
          },
        });
        await prisma.messages.create({
          data: {
            threadId: thread.id,
            channelId: channel.id,
            body: 'message',
            sentAt: new Date(),
            usersId: user1.id,
          },
        });
        const permissions = build('permissions', {
          manage: false,
          user: user2,
        });
        const result = await update({
          permissions,
          params: {
            threadId: thread.id,
            state: ThreadState.CLOSE,
            title: 'baz',
            pinned: true,
          },
        });
        const { status } = result as {
          status: number;
          data: SerializedThread;
        };
        expect(status).toEqual(403);
      });
    });
  });
});
