jest.mock('graphile-worker', () => ({}));
jest.mock('@linen/web/mailers/NotificationMailer', () => ({
  send: jest.fn(),
  sendMention: jest.fn(),
  sendThread: jest.fn(),
}));
jest.mock('./createNotificationEmailTask', () => ({
  createNotificationEmailTask: jest.fn(),
}));

import {
  accounts,
  auths,
  channels,
  messages,
  notificationType,
  threads,
  users,
  prisma,
} from '@linen/database';
import { create } from '@linen/factory';
import { serializeThread } from '@linen/serializers/thread';
import { serializeMessage } from '@linen/serializers/message';
import { createNotification } from './createNotification';
import { handleNotificationEmailTask } from './handleNotificationEmailTask';
import { handleNotificationEvent } from './handleNotificationEvent';
import * as createNotificationEmailTask from './createNotificationEmailTask';
import { randomUUID } from 'crypto';

const random = () => randomUUID();
const mockTimestamp = 0;
const minutes5 = 1000 * 60 * 5;
const minutes30 = 1000 * 60 * 30;

describe('notification service', () => {
  const email = random();
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
      redirectDomain: random(),
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
      email: random(),
      notificationsByEmail: true,
    });
    mockUser2 = await create('user', {
      accountsId: mockCommunity.id,
      authsId: mockAuth2.id,
    });

    mockAuth3 = await create('auth', {
      email: random(),
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
    await createNotification({
      authId: mockAuth.id,
      authorId: mockAuth.id,
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      threadId: mockThread1.id,
      messageId: mockMessage1.id,
      notificationType: notificationType.MENTION,
    });
    await createNotification({
      authId: mockAuth.id,
      authorId: mockAuth.id,
      channelId: mockChannel.id,
      communityId: mockCommunity.id,
      threadId: mockThread2.id,
      messageId: mockMessage2.id,
      notificationType: notificationType.MENTION,
    });

    const result = await handleNotificationEmailTask({
      authId: mockAuth.id,
      notificationType: notificationType.MENTION,
    });
    expect(result).toBeDefined();
    expect(result?.ok).toBe(true);
    expect(result?.howMany).toBe(2);

    const links = result?.links?.map((e: any) => e.url);
    expect(links).toStrictEqual([
      `http://${mockCommunity.redirectDomain}/t/${mockThread2.incrementId}`,
      `http://${mockCommunity.redirectDomain}/t/${mockThread1.incrementId}`,
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

    const mockCreateMailingJob = jest.spyOn(
      createNotificationEmailTask,
      'createNotificationEmailTask'
    );

    const thread = await prisma.threads.findUnique({
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

    await handleNotificationEvent(
      {
        channelId: mockChannel.id,
        communityId: mockCommunity.id,
        isReply: false,
        isThread: true,
        mentions: [],
        messageId: mockMessage1.id,
        threadId: mockMessage1.threadId,
        thread: JSON.stringify({ ...serializeThread(thread) }),
        mentionNodes: [],
      },
      jest.fn() as any
    );

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

    const thread = await prisma.threads.findUnique({
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

    const mockCreateMailingJob = jest.spyOn(
      createNotificationEmailTask,
      'createNotificationEmailTask'
    );

    await handleNotificationEvent(
      {
        channelId: mockChannel.id,
        communityId: mockCommunity.id,
        isReply: false,
        isThread: true,
        mentions: thread?.messages[0].mentions!,
        messageId: mockMessage1.id,
        threadId: mockMessage1.threadId,
        thread: JSON.stringify({ ...serializeThread(thread) }),
        mentionNodes: [],
      },
      jest.fn() as any
    );
    expect(mockCreateMailingJob).toHaveBeenCalledWith({
      helpers: expect.any(Function),
      jobKey: `mention-${mockUser2.authsId}`,
      payload: {
        authId: `${mockUser2.authsId}`,
        notificationType: 'MENTION',
      },
      runAt: new Date(mockTimestamp + minutes5),
    });
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

    const mockCreateMailingJob = jest.spyOn(
      createNotificationEmailTask,
      'createNotificationEmailTask'
    );

    const message = await prisma.messages.findFirst({
      where: { id: mockMessage2.id },
      include: {
        author: true,
        reactions: true,
        attachments: true,
        mentions: {
          include: {
            users: true,
          },
        },
      },
      rejectOnNotFound: true,
    });

    await handleNotificationEvent(
      {
        channelId: mockChannel.id,
        communityId: mockCommunity.id,
        isReply: true,
        isThread: false,
        mentions: [],
        messageId: mockMessage2.id,
        threadId: mockMessage2.threadId,
        message: JSON.stringify({ ...serializeMessage(message) }),
        mentionNodes: [],
      },
      jest.fn() as any
    );
    expect(mockCreateMailingJob).toHaveBeenCalledWith({
      helpers: expect.any(Function),
      jobKey: `thread-${mockUser.authsId}`,
      payload: {
        authId: `${mockUser.authsId}`,
        notificationType: 'THREAD',
      },
      runAt: new Date(mockTimestamp + minutes30),
    });
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

    const mockCreateMailingJob = jest.spyOn(
      createNotificationEmailTask,
      'createNotificationEmailTask'
    );

    const message = await prisma.messages.findFirst({
      where: { id: mockMessage3.id },
      include: {
        author: true,
        reactions: true,
        attachments: true,
        mentions: {
          include: {
            users: true,
          },
        },
      },
      rejectOnNotFound: true,
    });

    await handleNotificationEvent(
      {
        channelId: mockChannel.id,
        communityId: mockCommunity.id,
        isReply: true,
        isThread: false,
        mentions: [],
        messageId: mockMessage3.id,
        threadId: mockMessage3.threadId,
        message: JSON.stringify({ ...serializeMessage(message) }),
        mentionNodes: [],
      },
      jest.fn() as any
    );
    expect(mockCreateMailingJob).toHaveBeenCalledWith({
      helpers: expect.any(Function),
      jobKey: `thread-${mockUser.authsId}`,
      payload: {
        authId: `${mockUser.authsId}`,
        notificationType: 'THREAD',
      },
      runAt: new Date(mockTimestamp + minutes30),
    });
    expect(mockCreateMailingJob).toHaveBeenCalledWith({
      helpers: expect.any(Function),
      jobKey: `thread-${mockUser2.authsId}`,
      payload: {
        authId: `${mockUser2.authsId}`,
        notificationType: 'THREAD',
      },
      runAt: new Date(mockTimestamp + minutes30),
    });
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

    const mockCreateMailingJob = jest.spyOn(
      createNotificationEmailTask,
      'createNotificationEmailTask'
    );

    const message = await prisma.messages.findFirst({
      where: { id: mockMessage2.id },
      include: {
        author: true,
        reactions: true,
        attachments: true,
        mentions: {
          include: {
            users: true,
          },
        },
      },
      rejectOnNotFound: true,
    });

    await handleNotificationEvent(
      {
        channelId: mockChannel.id,
        communityId: mockCommunity.id,
        isReply: true,
        isThread: false,
        mentions: [],
        messageId: mockMessage2.id,
        threadId: mockMessage2.threadId,
        thread: JSON.stringify({ ...serializeMessage(message) }),
        mentionNodes: [],
      },
      jest.fn() as any
    );
    expect(mockCreateMailingJob).toHaveBeenCalledWith({
      helpers: expect.any(Function),
      jobKey: `thread-${mockUser.authsId}`,
      payload: {
        authId: `${mockUser.authsId}`,
        notificationType: 'THREAD',
      },
      runAt: new Date(mockTimestamp + minutes30),
    });
    expect(mockCreateMailingJob).toHaveBeenCalledWith({
      helpers: expect.any(Function),
      jobKey: `thread-${mockUser2.authsId}`,
      payload: {
        authId: `${mockUser2.authsId}`,
        notificationType: 'THREAD',
      },
      runAt: new Date(mockTimestamp + minutes30),
    });
    expect(mockCreateMailingJob).toBeCalledTimes(2);
  });
});
