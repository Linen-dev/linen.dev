import { Prisma, notificationType, prisma } from '@linen/database';
import NotificationMailer from 'mailers/NotificationMailer';
import { createMailingJob, createNewEventJob } from 'queue/jobs';
import { getCommunityUrl } from '@linen/serializers/settings';
import { getLinenUrl } from '@linen/utilities/domain';
import { appendProtocol } from '@linen/utilities/url';
import React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Message from '@linen/ui/Message';
import {
  emailNotificationPayloadType,
  notificationListenerType,
  MessageFormat,
} from '@linen/types';
import { serializeUser } from '@linen/serializers/user';
import { format as formatDate } from '@linen/utilities/date';

function buildScheduleDate(type: notificationType) {
  switch (type) {
    case notificationType.MENTION:
      return new Date(Date.now() + 1000 * 60 * 15); // 15m
    case notificationType.THREAD:
      return new Date(Date.now() + 1000 * 60 * 30); // 30m
    case notificationType.CHANNEL:
      return new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 1w
  }
}

// get notifications
export async function get({ authId }: { authId: string }) {
  const notifications = await prisma.notifications.findMany({
    include: {
      community: {
        select: {
          id: true,
          premium: true,
          redirectDomain: true,
          slackTeamId: true,
          slackDomain: true,
          discordDomain: true,
          discordServerId: true,
        },
      },
      thread: {
        select: {
          incrementId: true,
          slug: true,
          channel: {
            select: { channelName: true, accountId: true },
          },
        },
      },
    },
    where: { authId },
    orderBy: { createdAt: 'desc' },
  });

  const communitiesUrls: Record<string, string> = notifications
    .map((n) => n.community)
    .reduce((prev, curr) => {
      const url = getCommunityUrl(curr);
      return { ...prev, [curr.id]: url };
    }, {});

  return notifications.map(({ id, notificationType, thread, threadId }) => {
    const url = getThreadUrl(communitiesUrls)(thread!);
    return { id, notificationType, url, threadId };
  });
}

// mark as read
export async function mark({
  authId,
  threadId,
}: {
  authId: string;
  threadId: string;
}) {
  const notification = await prisma.notifications.findFirst({
    where: { authId, threadId },
  });
  if (!notification) {
    return { ok: false, result: 'not_found' };
  }
  await prisma.notifications.delete({ where: { id: notification.id } });
  return { ok: true, result: 'deleted' };
}

// create a notification
export async function create(data: Prisma.notificationsUncheckedCreateInput) {
  const exist = await prisma.notifications.findFirst({
    where: {
      authId: data.authId,
      channelId: data.channelId,
      notificationType: data.notificationType,
      ...(data.threadId && { threadId: data.threadId }),
    },
  });
  if (exist) {
    return exist;
  }
  return await prisma.notifications.create({ data });
}

// message event listener
export async function notificationListener(data: notificationListenerType) {
  // create a queue job allowing us to work asynchronously
  return await createNewEventJob(data.messageId, data);
}

// this function receive all new messages and create notifications jobs
export async function handleNewEvent(data: notificationListenerType) {
  const message = await prisma.messages.findUnique({
    select: {
      messageFormat: true,
      author: { select: { auth: { select: { id: true } } } },
    },
    where: { id: data.messageId },
  });

  if (!message) {
    return 'message not found';
  }

  if (message.messageFormat !== MessageFormat.LINEN) {
    return 'message is not from linen';
  }

  const authorId = message.author?.auth?.id;
  if (!authorId) {
    return 'missing authorId';
  }

  await processMentions(data, authorId);

  if (data.isReply) {
    await processSubscribers(data, authorId);
    // TODO: check for users subscribed to the channel
  }

  return 'ok';
}

async function processMentions(
  {
    mentions,
    channelId,
    threadId,
    communityId,
    messageId,
  }: notificationListenerType,
  authorId: string
) {
  for (const mention of mentions) {
    if (!mention?.users?.authsId) {
      continue;
    }
    try {
      const authId = mention.users.authsId;
      const type = notificationType.MENTION;
      await create({
        authId,
        authorId,
        channelId,
        communityId,
        threadId,
        messageId,
        notificationType: type,
      });
      const scheduleDate = buildScheduleDate(type); // add 15 min
      await createMailingJob(`mention-${authId}`, scheduleDate, {
        authId,
        notificationType: type,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export async function sendEmailNotificationTask(
  payload: emailNotificationPayloadType & {
    locked_at?: Date | null;
  }
) {
  if (payload.notificationType === 'MENTION') {
    return await sendEmailNotification(payload, NotificationMailer.sendMention);
  }
  if (payload.notificationType === 'THREAD') {
    return await sendEmailNotification(payload, NotificationMailer.sendThread);
  }
}

async function sendEmailNotification(
  payload: emailNotificationPayloadType & {
    locked_at?: Date | null;
  },
  sendEmail: typeof NotificationMailer.sendMention
) {
  try {
    const { authId, notificationType } = payload;

    // get similar notifications
    const notifications = await prisma.notifications.findMany({
      where: {
        authId,
        notificationType,
        createdAt: {
          lte: payload.locked_at || new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const howMany = notifications.length;

    if (!howMany || howMany === 0) {
      return { ok: false, message: 'notifications not found' };
    }

    const auth = await prisma.auths.findUnique({
      where: { id: authId },
    });

    if (!auth) {
      return { ok: false, message: 'user not found' };
    }

    if (!auth.notificationsByEmail) {
      return { ok: false, message: 'user opt out email notifications' };
    }

    // get authors
    const authors = (
      await Promise.all(
        notifications.map(
          async (n) =>
            await prisma.users.findFirst({
              select: { displayName: true, id: true },
              where: {
                displayName: {},
                accountsId: n.communityId,
                authsId: n.authorId,
              },
            })
        )
      )
    ).reduce((prev, curr) => {
      return Array.from(
        new Set([...prev, ...(curr?.displayName ? [curr.displayName] : [])])
      );
    }, [] as string[]);

    // get threads
    const messagesId = notifications.map((n) => n.messageId!).filter(Boolean);
    const threads = await prisma.messages.findMany({
      where: { id: { in: messagesId } },
      select: {
        body: true,
        sentAt: true,
        mentions: { select: { users: true } },
        threads: {
          select: {
            channel: { select: { channelName: true, accountId: true } },
            incrementId: true,
            slug: true,
            lastReplyAt: true,
          },
        },
      },
      orderBy: { threads: { lastReplyAt: 'desc' } },
    });

    // get communities
    const accountsId = threads
      .map((t) => t.threads?.channel.accountId!)
      .filter(Boolean);
    const communities = await prisma.accounts.findMany({
      where: { id: { in: accountsId } },
      select: {
        id: true,
        discordDomain: true,
        discordServerId: true,
        premium: true,
        redirectDomain: true,
        slackDomain: true,
        slackTeamId: true,
      },
    });
    const communitiesUrls: Record<string, string> = communities.reduce(
      (prev, curr) => {
        const url = getCommunityUrl(curr);
        return { ...prev, [curr.id]: url };
      },
      {}
    );

    // build links and notify
    const links = threads.map((t) => {
      const text = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Message, {
          text: t.body.length > 200 ? t.body.substring(0, 200) + '...' : t.body,
          mentions: t.mentions
            .filter((u) => u.users)
            .map((u) => serializeUser(u.users!)),
          format: MessageFormat.LINEN,
        })
      );
      return {
        date: formatDate(new Date(t.sentAt).toISOString(), 'PPpp'),
        text,
        url: getThreadUrl(communitiesUrls)(t.threads!),
      };
    });

    await sendEmail({
      authors:
        authors.length > 3 ? [...authors.splice(0, 3), 'others'] : authors,
      threads: links,
      to: auth.email,
      userName: auth.email,
      preferencesUrl: `${appendProtocol(getLinenUrl())}/profile`,
    });

    // clean up notifications from model
    await prisma.notifications.deleteMany({
      where: { id: { in: notifications.map((n) => n.id) } },
    });

    return { ok: true, howMany, links };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function getThreadUrl(communitiesUrls: Record<string, string>) {
  return (thread: {
    channel: { accountId: string | null; channelName: string };
    incrementId: number;
    slug: string | null;
  }): string => {
    const prefix = communitiesUrls[thread.channel.accountId!];
    const slug = thread.slug ? `/${thread.slug}` : ``;
    return `${prefix}/t/${thread.incrementId}${slug}`;
  };
}

async function processSubscribers(
  data: notificationListenerType,
  authorId: string
) {
  const thread = await prisma.threads.findUnique({
    select: {
      channel: { select: { accountId: true } },
      messages: {
        select: {
          author: { select: { id: true } },
          mentions: {
            select: {
              users: { select: { id: true } },
            },
          },
        },
      },
    },
    where: { id: data.threadId },
  });

  // unique users from mentions, replies and the author
  const users = thread?.messages
    .reduce(
      (prev, curr) =>
        Array.from(
          new Set([
            ...prev,
            ...(curr.author?.id ? [curr.author.id] : []),
            ...curr.mentions.reduce(
              (p, c) =>
                Array.from(
                  new Set([...p, ...(c.users?.id ? [c.users.id] : [])])
                ),
              [] as string[]
            ),
          ])
        ),
      [] as string[]
    )
    .filter((e) => e);

  const usersAuth = await prisma.users.findMany({
    select: { authsId: true },
    where: { id: { in: users }, authsId: {} },
  });

  return await Promise.allSettled(
    usersAuth.filter(skipSelfNotification(authorId)).map(async (user) => {
      const authId = user.authsId;
      if (!authId) throw 'authId not found';
      const type = notificationType.THREAD;
      await create({
        authId,
        authorId,
        channelId: data.channelId,
        communityId: data.communityId,
        threadId: data.threadId,
        messageId: data.messageId,
        notificationType: type,
      });
      const scheduleDate = buildScheduleDate(type); // add 30 min
      await createMailingJob(`thread-${authId}`, scheduleDate, {
        authId,
        notificationType: type,
      });
    })
  );
}

function skipSelfNotification(authorId: string) {
  return (value: { authsId: string | null }) => {
    return value.authsId !== authorId;
  };
}

export async function getSettings({ authId }: { authId: string }) {
  return await prisma.auths.findUnique({
    select: { notificationsByEmail: true },
    where: { id: authId },
  });
}

export async function updateSettings({
  authId,
  notificationsByEmail,
}: {
  authId: string;
  notificationsByEmail: boolean;
}) {
  return await prisma.auths.update({
    select: { notificationsByEmail: true },
    where: { id: authId },
    data: { notificationsByEmail },
  });
}
