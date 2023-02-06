import { findChannelsByAccount } from './channel';
import { prisma } from '@linen/database';
import { v4 } from 'uuid';
import { AccountType, MessageFormat } from '@linen/types';
import setup from '__tests__/spec-helpers/integration';

setup({ truncationStrategy: 'cascade' });

describe('channel lib', () => {
  describe('as crawler, finding channels by account', () => {
    const isCrawler = true;
    test.skip('it should not show hidden channels or channels with all hidden threads', async () => {
      const account = await createAccount();
      await expect(
        findChannelsByAccount({
          account,
          isCrawler,
        })
      ).resolves.toHaveLength(1);
      await expect(
        prisma.channels.count({ where: { account: { id: account.id } } })
      ).resolves.toBe(5);
      await expect(
        prisma.messages.count({
          where: { channel: { account: { id: account.id } } },
        })
      ).resolves.toBe(10);
      await expect(
        prisma.threads.count({
          where: { channel: { account: { id: account.id } } },
        })
      ).resolves.toBe(6);
    });
  });
  describe('as user, finding channels by account', () => {
    const isCrawler = false;
    test('it should not show hidden channels', async () => {
      const account = await createAccount();
      await expect(
        findChannelsByAccount({
          account,
          isCrawler,
        })
      ).resolves.toHaveLength(4);
      await expect(
        prisma.channels.count({ where: { account: { id: account.id } } })
      ).resolves.toBe(5);
      await expect(
        prisma.messages.count({
          where: { channel: { account: { id: account.id } } },
        })
      ).resolves.toBe(10);
      await expect(
        prisma.threads.count({
          where: { channel: { account: { id: account.id } } },
        })
      ).resolves.toBe(6);
    });
  });
});

async function createAccount() {
  const account = await prisma.accounts.create({
    data: { type: AccountType.PUBLIC },
  });
  // channel not hidden without threads
  await prisma.channels.create({
    data: {
      channelName: v4(),
      hidden: false,
      account: { connect: { id: account.id } },
    },
  });
  // channel hidden with threads
  const channel1 = await prisma.channels.create({
    data: {
      channelName: v4(),
      hidden: true,
      account: { connect: { id: account.id } },
    },
  });
  await createThreadWithMessage(channel1.id);
  // channel not hidden with threads
  const channel2 = await prisma.channels.create({
    data: {
      channelName: v4(),
      hidden: false,
      account: { connect: { id: account.id } },
    },
  });
  await createThreadWithMessage(channel2.id);
  await createThreadWithMessage(channel2.id, { hidden: true });

  // channel not hidden with threads hidden
  const channel3 = await prisma.channels.create({
    data: {
      channelName: v4(),
      hidden: false,
      account: { connect: { id: account.id } },
    },
  });
  await createThreadWithMessage(channel3.id, { hidden: true });
  await createThreadWithMessage(channel3.id, { hidden: true });

  // channel not hidden with threads
  const channel4 = await prisma.channels.create({
    data: {
      channelName: v4(),
      hidden: false,
      account: { connect: { id: account.id } },
    },
  });
  await createThreadWithMessage(channel4.id, { skipMessages: true });

  return account;
}

async function createThreadWithMessage(
  channelId: string,
  opts?: { hidden?: boolean; skipMessages?: boolean }
) {
  const sentAt = new Date();
  return await prisma.threads.create({
    data: {
      ...(!!opts?.hidden && { hidden: opts.hidden }),
      sentAt: sentAt.getTime(),
      lastReplyAt: sentAt.getTime(),
      channel: { connect: { id: channelId } },
      ...(!opts?.skipMessages && {
        messageCount: 2,
        messages: {
          createMany: {
            data: [
              {
                channelId: channelId,
                body: v4(),
                sentAt,
                messageFormat: MessageFormat.LINEN,
              },
              {
                channelId: channelId,
                body: v4(),
                sentAt,
                messageFormat: MessageFormat.LINEN,
              },
            ],
          },
        },
      }),
    },
  });
}
