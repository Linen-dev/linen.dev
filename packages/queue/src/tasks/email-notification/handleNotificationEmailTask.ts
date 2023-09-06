import NotificationMailer from '@linen/web/mailers/NotificationMailer';
import { getCommunityUrl } from '@linen/serializers/settings';
import { getLinenUrl } from '@linen/utilities/domain';
import { appendProtocol } from '@linen/utilities/url';
import React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import Message from '@linen/ui/Message';
import { emailNotificationPayloadType, MessageFormat } from '@linen/types';
import { serializeUser } from '@linen/serializers/user';
import { format as formatDate } from '@linen/utilities/date';
import { prisma } from '@linen/database';

export async function handleNotificationEmailTask(
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
