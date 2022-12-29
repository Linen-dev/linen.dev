import {
  accounts,
  auths,
  channels,
  messages,
  notifications,
  notificationType,
  threads,
  users,
} from '@prisma/client';
import { v4 } from 'uuid';
import { create } from '__tests__/factory';
import * as service from './notifications';
import * as queue from 'queue/tasks/email-notification';
import prisma from 'client';
import serializeThread from 'serializers/thread';
import serializeMessage from 'serializers/message';

jest.mock('queue/tasks/email-notification');

const mockTimestamp = 0;
const minutes15 = 1000 * 60 * 15;
const minutes30 = 1000 * 60 * 30;

describe('notification service', () => {
  const email = v4();
  let mockAuth: auths,
    mockAuth2: auths,
    mockAuth3: auths,
    mockUser: users,
    mockUser2: users,
    mockUser3: users,
    mockCommunity: accounts,
    mockChannel: channels;

  beforeAll(async () => {
    mockCommunity = await create('account', {
      premium: true,
      redirectDomain: v4(),
    });
    mockChannel = await create('channel', {
      accountId: mockCommunity.id,
    });

    mockAuth = await create('auth', { email, notificationsByEmail: true });
    mockUser = await create('user', {
      accountsId: mockCommunity.id,
      authsId: mockAuth.id,
    });

    mockAuth2 = await create('auth', {
      email: v4(),
      notificationsByEmail: true,
    });
    mockUser2 = await create('user', {
      accountsId: mockCommunity.id,
      authsId: mockAuth2.id,
    });

    mockAuth3 = await create('auth', {
      email: v4(),
      notificationsByEmail: true,
    });
    mockUser3 = await create('user', {
      accountsId: mockCommunity.id,
      authsId: mockAuth3.id,
    });
  });

  beforeEach(() => {
    jest.resetAllMocks();
    global.Date.now = jest.fn(() => mockTimestamp);
  });

  test('sendEmailNotificationTask', async () => {
    let mockThread1 = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });
    let mockMessage1: messages = await create('message', {
      threadId: mockThread1.id,
      channelId: mockChannel.id,
      usersId: mockUser.id,
    });
    let mockThread2 = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });
    let mockMessage2: messages = await create('message', {
      threadId: mockThread2.id,
      channelId: mockChannel.id,
      usersId: mockUser.id,
    });
    await service.create({
      authId: mockAuth.id,
      authorId: mockAuth.id,
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      threadId: mockThread1.id,
      messageId: mockMessage1.id,
      notificationType: notificationType.MENTION,
    });
    await service.create({
      authId: mockAuth.id,
      authorId: mockAuth.id,
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      threadId: mockThread2.id,
      messageId: mockMessage2.id,
      notificationType: notificationType.MENTION,
    });

    const result = await service.sendEmailNotificationTask({
      authId: mockAuth.id,
      notificationType: notificationType.MENTION,
    });
    expect(result).toBeDefined();
    expect(result?.ok).toBe(true);
    expect(result?.howMany).toBe(2);

    const links = result?.links?.map((e) => e.url);
    expect(links).toStrictEqual([
      `https://${mockCommunity.redirectDomain}/t/${mockThread2.incrementId}`,
      `https://${mockCommunity.redirectDomain}/t/${mockThread1.incrementId}`,
    ]);
  });

  test('user1 creates thread1 without mentioning, it should not notify', async () => {
    let mockThread1: threads = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });
    let mockMessage1: messages = await create('message', {
      threadId: mockThread1.id,
      channelId: mockChannel.id,
      usersId: mockUser.id,
    });

    const mockCreateMailingJob = jest.spyOn(queue, 'createMailingJob');

    const thread = await prisma.threads.findFirst({
      where: { id: mockThread1.id },
      include: {
        messages: {
          include: {
            author: true,
            mentions: {
              include: {
                users: {
                  include: {
                    auth: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    await service.handleNewEvent({
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      isReply: false,
      isThread: true,
      mentions: [],
      messageId: mockMessage1.id,
      threadId: mockMessage1.threadId,
      thread: JSON.stringify({ ...serializeThread(thread) }),
    });

    expect(mockCreateMailingJob).toBeCalledTimes(0);
  });

  test('user1 creates thread2 mentioning user2, it should notify user2', async () => {
    let mockThread2: threads = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });
    let mockMessage1: messages = await create('message', {
      threadId: mockThread2.id,
      channelId: mockChannel.id,
      usersId: mockUser.id,
      mentions: {
        create: {
          usersId: mockUser2.id,
        },
      },
    });

    const thread = await prisma.threads.findFirst({
      where: { id: mockThread2.id },
      include: {
        messages: {
          include: {
            author: true,
            mentions: {
              include: {
                users: {
                  include: {
                    auth: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const mockCreateMailingJob = jest.spyOn(queue, 'createMailingJob');

    await service.handleNewEvent({
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      isReply: false,
      isThread: true,
      mentions: thread?.messages[0].mentions!,
      messageId: mockMessage1.id,
      threadId: mockMessage1.threadId,
      thread: JSON.stringify({ ...serializeThread(thread) }),
    });
    expect(mockCreateMailingJob).toHaveBeenCalledWith(
      `mention-${mockUser2.authsId}`,
      new Date(mockTimestamp + minutes15),
      {
        authId: `${mockUser2.authsId}`,
        notificationType: 'MENTION',
      }
    );
    expect(mockCreateMailingJob).toBeCalledTimes(1);
  });

  test('user2 reply on thread1, it should notify user1', async () => {
    let mockThread1: threads = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });
    let mockMessage1: messages = await create('message', {
      threadId: mockThread1.id,
      channelId: mockChannel.id,
      usersId: mockUser.id,
    });
    let mockMessage2: messages = await create('message', {
      threadId: mockThread1.id,
      channelId: mockChannel.id,
      usersId: mockUser2.id,
    });

    const mockCreateMailingJob = jest.spyOn(queue, 'createMailingJob');

    const message = await prisma.messages.findFirst({
      where: { id: mockMessage2.id },
      include: {
        author: true,
        mentions: {
          include: {
            users: {
              include: {
                auth: true,
              },
            },
          },
        },
      },
    });

    await service.handleNewEvent({
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      isReply: true,
      isThread: false,
      mentions: [],
      messageId: mockMessage2.id,
      threadId: mockMessage2.threadId,
      message: JSON.stringify({ ...serializeMessage(message) }),
    });

    expect(mockCreateMailingJob).toHaveBeenCalledWith(
      `thread-${mockUser.authsId}`,
      new Date(mockTimestamp + minutes30),
      {
        authId: `${mockUser.authsId}`,
        notificationType: 'THREAD',
      }
    );
    expect(mockCreateMailingJob).toBeCalledTimes(1);
  });

  test('user3 reply on thread1, it should notify user1 and user2', async () => {
    let mockThread1: threads = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });
    let mockMessage1: messages = await create('message', {
      threadId: mockThread1.id,
      channelId: mockChannel.id,
      usersId: mockUser.id,
    });
    let mockMessage2: messages = await create('message', {
      threadId: mockThread1.id,
      channelId: mockChannel.id,
      usersId: mockUser2.id,
    });
    let mockMessage3: messages = await create('message', {
      threadId: mockThread1.id,
      channelId: mockChannel.id,
      usersId: mockUser3.id,
    });

    const mockCreateMailingJob = jest.spyOn(queue, 'createMailingJob');

    const message = await prisma.messages.findFirst({
      where: { id: mockMessage3.id },
      include: {
        author: true,
        mentions: {
          include: {
            users: {
              include: {
                auth: true,
              },
            },
          },
        },
      },
    });

    await service.handleNewEvent({
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      isReply: true,
      isThread: false,
      mentions: [],
      messageId: mockMessage3.id,
      threadId: mockMessage3.threadId,
      message: JSON.stringify({ ...serializeMessage(message) }),
    });

    expect(mockCreateMailingJob).toHaveBeenCalledWith(
      `thread-${mockUser.authsId}`,
      new Date(mockTimestamp + minutes30),
      {
        authId: `${mockUser.authsId}`,
        notificationType: 'THREAD',
      }
    );
    expect(mockCreateMailingJob).toHaveBeenCalledWith(
      `thread-${mockUser2.authsId}`,
      new Date(mockTimestamp + minutes30),
      {
        authId: `${mockUser2.authsId}`,
        notificationType: 'THREAD',
      }
    );

    expect(mockCreateMailingJob).toBeCalledTimes(2);
  });

  test('user3 reply on thread2, it should notify user1 and user2', async () => {
    let mockThread2: threads = await create('thread', {
      channelId: mockChannel.id,
      lastReplyAt: new Date().getTime(),
    });
    let mockMessage1: messages = await create('message', {
      threadId: mockThread2.id,
      channelId: mockChannel.id,
      usersId: mockUser.id,
      mentions: {
        create: {
          usersId: mockUser2.id,
        },
      },
    });
    let mockMessage2: messages = await create('message', {
      threadId: mockThread2.id,
      channelId: mockChannel.id,
      usersId: mockUser3.id,
    });

    const mockCreateMailingJob = jest.spyOn(queue, 'createMailingJob');

    const message = await prisma.messages.findFirst({
      where: { id: mockMessage2.id },
      include: {
        author: true,
        mentions: {
          include: {
            users: {
              include: {
                auth: true,
              },
            },
          },
        },
      },
    });

    await service.handleNewEvent({
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      isReply: true,
      isThread: false,
      mentions: [],
      messageId: mockMessage2.id,
      threadId: mockMessage2.threadId,
      thread: JSON.stringify({ ...serializeMessage(message) }),
    });
    expect(mockCreateMailingJob).toHaveBeenCalledWith(
      `thread-${mockUser.authsId}`,
      new Date(mockTimestamp + minutes30),
      {
        authId: `${mockUser.authsId}`,
        notificationType: 'THREAD',
      }
    );
    expect(mockCreateMailingJob).toHaveBeenCalledWith(
      `thread-${mockUser2.authsId}`,
      new Date(mockTimestamp + minutes30),
      {
        authId: `${mockUser2.authsId}`,
        notificationType: 'THREAD',
      }
    );
    expect(mockCreateMailingJob).toBeCalledTimes(2);
  });
});
